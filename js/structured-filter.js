﻿/*!
     _                   _                      _      __ _ _ _
 ___| |_ _ __ _   _  ___| |_ _   _ _ __ ___  __| |    / _(_) | |_ ___ _ __
/ __| __| '__| | | |/ __| __| | | | '__/ _ \/ _` |___| |_| | | __/ _ \ '__|
\__ \ |_| |  | |_| | (__| |_| |_| | | |  __/ (_| |___|  _| | | ||  __/ |
|___/\__|_|   \__,_|\___|\__|\__,_|_|  \___|\__,_|   |_| |_|_|\__\___|_|

 * structured-filter 2.0.5
 * https://github.com/evoluteur/structured-filter
 * (c) 2024 Olivier Giulieri
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.button.js
 *	jquery.ui.datepicker.js
 */

(function ($, undefined) {
  // - field types
  var fTypes = {
      text: "text",
      bool: "boolean",
      number: "number",
      date: "date",
      time: "time",
      list: "list",
      listOpts: "list-options",
      listDropdown: "list-dropdown",
      inputAutoc: "input-autocomplete"
    },
    // - i18n strings (to translate in other languages)
    i18n = {
      sEqual: "equals",
      sNotEqual: "not equal",
      sStart: "starts with",
      sContain: "contains",
      sNotContain: "doesn't contain",
      sFinish: "finishes with",
      sInList: "any of",
      sIsNull: "is empty",
      sIsNotNull: "is not empty",
      sBefore: "before",
      sAfter: "after",
      sNumEqual: "&#61;",
      sNumNotEqual: "!&#61;",
      sGreater: "&#62;",
      sSmaller: "&#60;",
      sOn: "on",
      sNotOn: "not on",
      sAt: "at",
      sNotAt: "not at",
      sBetween: "between",
      sNotBetween: "not between",
      opAnd: "and",
      //opOr:'or',
      yes: "Yes",
      no: "No",
      bNewCond: "New filter condition",
      bAddCond: "Add condition",
      bUpdateCond: "Update condition",
      bSubmit: "Submit",
      bCancel: "Cancel",
    },
    // - list of operators (for conditions)
    evoAPI = {
      sEqual: "eq",
      sNotEqual: "ne",
      sStart: "sw",
      sContain: "ct",
      sNotContain: "nct",
      sFinish: "fw",
      sInList: "in",
      sIsNull: "null",
      sIsNotNull: "nn",
      sGreater: "gt",
      sSmaller: "lt",
      sBetween: "bw",
      sNotBetween: "nbw",
    },
    isNotFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") === -1;

  $.widget("evol.structFilter", {
    options: {
      fields: [],
      dateFormat: "mm/dd/yy",
      highlight: true,
      buttonLabels: false,
      submitButton: false,
      submitReady: false,
      disableOperators: false,
    },

    _create: function () {
      var bLabels = this.options.buttonLabels,
        that = this,
        e = this.element,
        fnLink = function (css, label, hidden) {
          return (
            '<a class="' +
            css +
            '"' +
            (hidden ? ' style="display:none;"' : "") +
            ' href="javascript:void(0)">' +
            label +
            "</a>"
          );
        },
        h =
          '<div class="evo-searchFilters"></div>' +
          fnLink("evo-bNew", i18n.bNewCond);
      if (this.options.submitButton) {
        h += fnLink("evo-bSubmit", i18n.bSubmit);
      }
      h +=
        '<div class="evo-editFilter"></div>' +
        fnLink("evo-bAdd", i18n.bAddCond, true) +
        fnLink("evo-bDel", i18n.bCancel, true);
      this._step = 0;
      e.addClass("structFilter ui-widget-content ui-corner-all").html(h);
      if (this.options.submitReady) {
        this._hValues = $("<span></span>").appendTo(e);
      }
      // - button submit
      if (this.options.submitButton) {
        this._bSubmit = e
          .find(".evo-bSubmit")
          .button({
            showLabel: bLabels,
          })
          .on("click", function (e) {
            that.element.trigger("submit.search");
          });
      }
      // - editor button new
      this._bNew = e
        .find(".evo-bNew")
        .button({
          showLabel: bLabels,
          icon: "ui-icon-plusthick",
          iconPosition: "end",
        })
        .on("click", function (e) {
          if (that._step < 1) {
            that._setEditorField();
            that._step = 1;
          }
          that._bAdd.find(".ui-button-text").html(i18n.bAddCond);
        });
      // - editor button add
      this._bAdd = e
        .find(".evo-bAdd")
        .button({
          showLabel: bLabels,
          icon: "ui-icon-check",
          iconPosition: "end",
        })
        .on("click", function (evt) {
          var data = that._getEditorData();
          if (that._cFilter) {
            that._enableFilter(data, that.options.highlight);
          } else {
            that.addCondition(data);
          }
          that._removeEditor();
        });
      // - editor button cancel
      this._bDel = e
        .find(".evo-bDel")
        .button({
          showLabel: bLabels,
          icon: "ui-icon-close",
          iconPosition: "end",
        })
        .on("click", function (evt) {
          that._removeEditor();
        });
      this._editor = e
        .find(".evo-editFilter")
        .on("change", "#field", function (evt) {
          evt.stopPropagation();
          if (that._step > 2) {
            that._editor.find("#value,#value2,.as-Txt").remove();
          }
          if (that._step > 1) {
            that._editor.find("#operator").remove();
            that._bAdd.hide();
          }
          that._step = 1;
          var fieldID = $(evt.currentTarget).val();
          if (fieldID !== "") {
            that._field = that._getFieldById(fieldID);
            var fType = (that._type = that._field.type);
            that._setEditorOperator();
            if (fType === fTypes.bool || fType.startsWith("list") || fType.startsWith('input')) {
              that._setEditorValue();
            }
          } else {
            that._field = that._type = null;
          }
        })
        .on("change", "#operator", function (evt) {
          evt.stopPropagation();
          that._operator = $(this).val();
          if (that._step > 2) {
            that._editor.find("#value,#value2,.as-Txt").remove();
            that._bAdd.hide();
            that._step = 2;
          }
          that._setEditorValue();
        })
        .on("change keyup", "#value,#value2", function (evt) {
          evt.stopPropagation();
          var fType = that._type,
            value = $(this).val(),
            valid =
            value !== "" || fType === fTypes.bool || fType.startsWith("list") || fType.startsWith('input');
          if (fType == fTypes.number) {
            valid = valid && !isNaN(value);
          } else if (
            that._operator == evoAPI.sBetween ||
            that._operator == evoAPI.sNotBetween
          ) {
            valid =
              that._editor.find("#value").val() !== "" &&
              that._editor.find("#value2").val() !== "";
          }
          if (valid) {
            that._bAdd.button("enable");
            if (evt.which == 13) {
              that._bAdd.trigger("click");
            }
          } else {
            that._bAdd.button("disable");
          }
        })
        .on("click", "#checkAll", function () {
          var $this = $(this),
            vc = $this.prop("checked");
          allChecks = $this.parent().parent().find("input").prop("checked", vc);
        });
      this._filters = e
        .find(".evo-searchFilters")
        .on("click", "a", function () {
          that._editFilter($(this));
        })
        .on("click", "a .ui-button-icon", function (evt) {
          evt.stopPropagation();
          var filter = $(this).parent();
          if (!filter.hasClass("ui-state-disabled")) {
            filter.fadeOut("slow", function () {
              filter.remove();
              that._triggerChange();
            });
          }
        });
    },

    _getFieldById: function (fId) {
      if (!this._hash) {
        this._hash = {};
        var fields = this.options.fields;
        for (var i = 0, iMax = fields.length; i < iMax; i++) {
          this._hash[fields[i].id] = fields[i];
        }
      }
      return this._hash[fId];
    },

    _removeEditor: function () {
      this._editor.empty();
      this._bAdd.hide();
      this._bDel.hide();
      this._enableFilter(null, false);
      this._bNew.removeClass("ui-state-active").show();
      if (this._bSubmit) {
        this._bSubmit.removeClass("ui-state-active").show();
      }
      if (isNotFirefox) {
        // setting focus w/ ff takes too long
        this._bNew.focus();
      }
      this._step = 0;
      this._field = this._type = this._operator = null;
    },

    addCondition: function (filter) {
      var f = $(
        '<a href="javascript:void(0)"><span>' +
          this._htmlFilter(filter) +
          "</span></a>"
      )
        .prependTo(this._filters)
        .button({
          icon: "ui-icon-close",
          iconPosition: "end",
        })
        .data("filter", filter)
        .fadeIn();
      if (this.options.highlight) {
        f.effect("highlight");
      }
      this._triggerChange();
      if (this._bSubmit) {
        this._bSubmit.removeClass("ui-state-active").show();
      }
      return this;
    },

    removeCondition: function (index) {
      this._removeEditor();
      this._filters.children().eq(index).remove();
      this._triggerChange();
      return this;
    },

    _htmlFilter: function (filter) {
      var h =
        '<span class="evo-lBold">' +
        filter.field.label +
        "</span> " +
        '<span class="evo-lLight">' +
        filter.operator.label +
        "</span> " +
        '<span class="evo-lBold">' +
        filter.value.label +
        "</span>";
      if (
        filter.operator.value == evoAPI.sBetween ||
        filter.operator.value == evoAPI.sNotBetween
      ) {
        h +=
          '<span class="evo-lLight"> ' +
          i18n.opAnd +
          " </span>" +
          '<span class="evo-lBold">' +
          filter.value.label2 +
          "</span>";
      }
      return h;
    },

    _enableFilter: function (filter, anim) {
      if (this._cFilter) {
        this._cFilter
          .button("enable")
          .removeClass("ui-state-hover ui-state-active");
        if (anim) {
          this._cFilter.effect("highlight");
        }
        if (filter) {
          this._cFilter
            .data("filter", filter)
            .find(":first-child")
            .html(this._htmlFilter(filter));
          this._cFilter = null;
          this._triggerChange();
        } else {
          this._cFilter = null;
        }
      }
    },

    _editFilter: function ($filter) {
      var filter = $filter.data("filter"),
        fid = filter.field.value,
        op = filter.operator.value,
        fv = filter.value;
      this._enableFilter(null, false);
      this._removeEditor();
      this._cFilter = $filter.button("disable");
      this._setEditorField(fid);
      this._setEditorOperator(op);
      if (op == evoAPI.sBetween || op == evoAPI.sNotBetween) {
        this._setEditorValue(fv.value, fv.value2);
      } else {
        this._setEditorValue(fv.value);
      }
      this._bAdd.find(".ui-button-text").html(i18n.bUpdateCond);
      this._step = 3;
    },

    _setEditorField: function (fid) {
      if (this._step < 1) {
        this._bNew.stop().hide();
        if (this._bSubmit) {
          this._bSubmit.stop().hide();
        }
        this._bDel.show();
        if (!this._fList) {
          this._fList =
          '<select id="field" class="selectize">' +
            EvoUI.optNull +
            this.options.fields.map(function (f) {
              return EvoUI.inputOption(f.id, f.label);
            }) +
            "</select>";
        }
        $(this._fList).appendTo(this._editor).focus();
      }
      if (fid) {
        this._field = this._getFieldById(fid);
        this._type = this._field.type;
        this._editor.find("#field").val(fid);
      }
      this._step = 1;
    },

    _setEditorOperator: function (cond) {
      if (this.options.disableOperators) {
        this._step = 2;
        return this._setEditorValue();
      }

      var fType = this._type;
      if (this._step < 2) {
        var h = "",
          opt = EvoUI.inputOption;
        switch (fType) {
          case fTypes.list:
            //h.push(i18n.sInList);
            h += EvoUI.inputHidden("operator", evoAPI.sInList);
            this._operator = evoAPI.sInList;
            break;
          case fTypes.listOpts:
          case fTypes.listDropdown:
            case fTypes.inputAutoc:
          case fTypes.bool:
            //h.push(i18n.sEqual);
            h += EvoUI.inputHidden("operator", evoAPI.sEqual);
            this._operator = evoAPI.sEqual;
            break;
          default:
            h += '<select id="operator">' + EvoUI.optNull;
            switch (fType) {
              case fTypes.date:
              case fTypes.time:
                if (fType == fTypes.time) {
                  h +=
                    opt(evoAPI.sEqual, i18n.sAt) +
                    opt(evoAPI.sNotEqual, i18n.sNotAt);
                } else {
                  h +=
                    opt(evoAPI.sEqual, i18n.sOn) +
                    opt(evoAPI.sNotEqual, i18n.sNotOn);
                }
                h +=
                  opt(evoAPI.sGreater, i18n.sAfter) +
                  opt(evoAPI.sSmaller, i18n.sBefore) +
                  opt(evoAPI.sBetween, i18n.sBetween) +
                  opt(evoAPI.sNotBetween, i18n.sNotBetween);
                break;
              case fTypes.number:
                h +=
                  opt(evoAPI.sEqual, i18n.sNumEqual) +
                  opt(evoAPI.sNotEqual, i18n.sNumNotEqual) +
                  opt(evoAPI.sGreater, i18n.sGreater) +
                  opt(evoAPI.sSmaller, i18n.sSmaller);
                break;
              default:
                h +=
                  opt(evoAPI.sEqual, i18n.sEqual) +
                  opt(evoAPI.sNotEqual, i18n.sNotEqual) +
                  opt(evoAPI.sStart, i18n.sStart) +
                  opt(evoAPI.sContain, i18n.sContain) +
                  opt(evoAPI.sNotContain, i18n.sNotContain) +
                  opt(evoAPI.sFinish, i18n.sFinish);
            }
            h +=
              opt(evoAPI.sIsNull, i18n.sIsNull) +
              opt(evoAPI.sIsNotNull, i18n.sIsNotNull) +
              "</select>";
        }
        this._editor.append(h);
      }
      if (cond && fType != fTypes.list) {
        this._editor.find("#operator").val(cond);
        this._operator = cond;
      }
      this._step = 2;
    },

    _setEditorValue: function (v, v2) {
      var editor = this._editor,
        fld = this._field,
        fType = this._type,
        opVal = editor.find("#operator").val(),
        opBetween = false,
        addOK = true;
      if (opVal !== "") {
        if (
          fType != fTypes.list &&
          (opVal == evoAPI.sIsNull || opVal == evoAPI.sIsNotNull)
        ) {
          editor.append(EvoUI.inputHidden("value", ""));
        } else {
          if (this._step < 3) {
            var h = "";
            opBetween = opVal == evoAPI.sBetween || opVal == evoAPI.sNotBetween;
            switch (fType) {
              case fTypes.bool:
                h +=
                  '<span id="value">' +
                  EvoUI.inputRadio("value", "1", i18n.yes, v != "0", "value1") +
                  EvoUI.inputRadio("value", "0", i18n.no, v == "0", "value0") +
                  "</span>";
                break;
              case fTypes.list:
                h += '<span id="value">';
                if (fld.list.length > 7) {
                  h +=
                    '<label for="checkAll">(<input type="checkbox" id="checkAll" value="1">All )</label> ';
                }
                h += EvoUI.inputCheckboxes(fld.list) + "</span>";
                break;
              case fTypes.listOpts:
                h +=
                  '<span id="value">' +
                  fld.list
                    .map(function (item) {
                      return EvoUI.inputRadio(
                        fld.id,
                        item.id,
                        item.label,
                        v == item.id,
                        "value" + item.id
                      );
                    })
                    .join("") +
                  "</span>";
                break;
              case fTypes.listDropdown:
                h +=
                  '<select id="value">' +
                  EvoUI.optNull +
                  fld.list
                    .map(function (item) {
                      return EvoUI.inputOption(item.id, item.label);
                    })
                    .join("") +
                  "</select>";
                  break;
              case fTypes.inputAutoc:
                console.log('autocomplete input');
                var autoCompleteObj = '<input id="value" type="text" class="basicAutoComplete" data-url="'+fld.api+'" autocomplete="off">';
                h +=
                  autoCompleteObj;
                break;
              case fTypes.date:
              case fTypes.time:
              case fTypes.number:
                var iType = fType == fTypes.date ? "text" : fType;
                h += '<input id="value" type="' + iType + '">';
                if (opBetween) {
                  h +=
                    '<span class="as-Txt">' +
                    i18n.opAnd +
                    " </span>" +
                    '<input id="value2" type="' +
                    iType +
                    '">';
                }
                addOK = false;
                break;
              default:
                h += '<input id="value" type="text">';
                addOK = false;
            }
            editor.append(h);
            if (fType == fTypes.date) {
              editor
                .find("#value,#value2")
                .datepicker({ dateFormat: this.options.dateFormat });
            }
            if (fType == fTypes.inputAutoc) {
              editor
                .find("#value")
                .each(function(){
                  var $this = $(this);
                  var url = $(this).data('url');
                  $this.autocomplete({
                    source: function (request, response) {
                      jQuery.get(url, {
                        s: request.term
                        }, function (data) {
                            response(data);
                        });
                    },
                      minLength: 3
                  });
                });
            }
          }
          if (v) {
            var $value = editor.find("#value");
            switch (fType) {
              case fTypes.list:
                $value
                  .find("#" + v.split(",").join(",#"))
                  .prop("checked", "checked");
                break;
              case fTypes.listOpts:
              case fTypes.bool:
                $value.find("#value" + v).prop("checked", "checked");
                break;
              default:
                $value.val(v);
                addOK = v !== "";
                if (opBetween) {
                  $value.next().next().val(v2);
                  addOK = v !== "" && v2 !== "";
                }
            }
          } else {
            addOK =
              fType == fTypes.list ||
              fType == fTypes.listDropdown ||
              fType == fTypes.bool;
          }
        }
        this._bAdd.button(addOK ? "enable" : "disable").show();
        this._step = 3;
      }
    },

    _getEditorData: function () {
      var e = this._editor,
        f = e.find("#field"),
        v = e.find("#value"),
        filter = {
          field: {
            label: f.find("option:selected").text(),
            value: f.val(),
          },
          operator: {},
          value: {},
        },
        op = filter.operator,
        fv = filter.value;
      if (this._type == fTypes.list) {
        var vs = [],
          ls = [];
        v.find("input:checked")
          .not("#checkAll")
          .each(function () {
            vs.push(this.value);
            ls.push($(this).parent().text());
          });
        if (vs.length === 0) {
          op.label = i18n.sIsNull;
          op.value = evoAPI.sIsNull;
          fv.label = fv.value = "";
        } else if (vs.length == 1) {
          op.label = i18n.sEqual;
          op.value = evoAPI.sEqual;
          fv.label = '"' + ls[0] + '"';
          fv.value = vs[0];
        } else {
          op.label = i18n.sInList;
          op.value = evoAPI.sInList;
          fv.label = "(" + ls.join(", ") + ")";
          fv.value = vs.join(",");
        }
      } else if (this._type == fTypes.bool) {
        op.label = i18n.sEqual;
        op.value = evoAPI.sEqual;
        var val = v.find("#value1").prop("checked") ? 1 : 0;
        fv.label = val == 1 ? i18n.yes : i18n.no;
        fv.value = val;
      } else if (this._type == fTypes.listOpts) {
        op.label = i18n.sEqual;
        op.value = evoAPI.sEqual;
        var sel = v.find("input:checked");
        fv.label = sel.parent().text();
        fv.value = sel.prop("id").slice(5);
      } else if (this._type == fTypes.listDropdown) {
        op.label = i18n.sEqual;
        op.value = evoAPI.sEqual;
        var vval = v.val();
        if (vval) {
          fv.label = v.find("option[value=" + vval + "]").text();
        } else {
          fv.label = i18n.sIsNull;
        }
        fv.value = v.val();
      } 
      else if (this._type == fTypes.inputAutoc) {
        op.label = i18n.sIs;
        op.value = evoAPI.sEqual;
        var val = v.val()
        console.log(val);
        fv.label = val;
        fv.value = val;
      } 
      else {
        var o = e.find("#operator"),
          opVal = o.val();
        op.label = o.find("option:selected").text();
        op.value = opVal;
        if (opVal == evoAPI.sIsNull || opVal == evoAPI.sIsNotNull) {
          fv.label = fv.value = "";
        } else {
          if (
            this._type == fTypes.number ||
            this._type == fTypes.date ||
            this._type == fTypes.time
          ) {
            fv.label = v.val();
          } else {
            fv.label = '"' + v.val() + '"';
          }
          fv.value = v.val();
          if (opVal == evoAPI.sBetween || opVal == evoAPI.sNotBetween) {
            fv.label2 = fv.value2 = v.next().next().val();
          }
        }
      }
      return filter;
    },

    _hiddenValue: function (h, filter, idx) {
      h.push(
        EvoUI.inputHidden("fld-" + idx, filter.field.value) +
          EvoUI.inputHidden("op-" + idx, filter.operator.value) +
          EvoUI.inputHidden("val-" + idx, filter.value.value)
      );
      var v2 = filter.value.value2;
      if (v2) {
        h.push(EvoUI.inputHidden("val2-" + idx, v2));
      }
    },

    _setHiddenValues: function () {
      var vs = this.val(),
        iMax = vs.length,
        h = [EvoUI.inputHidden("elem", iMax)];
      for (var i = 0; i < iMax; i++) {
        this._hiddenValue(h, vs[i], i + 1);
      }
      //h.push('&label=',encodeURIComponent(this.valText()));
      this._hValues.html(h.join(""));
    },

    _triggerChange: function () {
      if (this.options.submitReady) {
        this._setHiddenValues();
      }
      this.element.trigger("change.search");
    },

    val: function (value) {
      // - sets or returns filter object
      if (typeof value == "undefined") {
        // --- get value
        var ret = [];
        this._filters.find("a").each(function () {
          ret.push($(this).data("filter"));
        });
        return ret;
      } else {
        // --- set value
        this._filters.empty();
        for (var i = 0, iMax = value.length; i < iMax; i++) {
          this.addCondition(value[i]);
        }
        this._triggerChange();
        return this;
      }
    },

    valText: function () {
      // - returns filter "text" value as displayed to the user.
      var ret = [];
      this._filters.find("a").each(function () {
        ret.push(this.text.trim());
      });
      return ret.join(" " + i18n.opAnd + " ");
    },

    valUrl: function () {
      // - returns filter url
      var vs = this.val(),
        iMax = vs.length,
        url = "filters=" + iMax;
      if (iMax < 1) {
        return "";
      }
      vs.forEach(function (v, idx) {
        url +=
          "&field-" +
          idx +
          "=" +
          v.field.value +
          "&operator-" +
          idx +
          "=" +
          v.operator.value +
          "&value-" +
          idx +
          "=" +
          encodeURIComponent(v.value.value);
        if (
          v.operator.value == evoAPI.sBetween ||
          v.operator.value == evoAPI.sNotBetween
        ) {
          url += "&value2-" + idx + "=" + encodeURIComponent(v.value.value2);
        }
      });
      url += "&label=" + encodeURIComponent(this.valText());
      return url;
    },

    clear: function () {
      this._cFilter = null;
      this._removeEditor();
      this._filters.empty();
      this._triggerChange();
      return this;
    },

    length: function () {
      return this._filters.children().length;
    },

    destroy: function () {
      var e = this.element.off();
      e.find(".evo-bNew,.evo-bAdd,.evo-bDel,.evo-searchFilters").off();
      this._editor.off();
      this.clear();
      e.empty().removeClass("structFilter ui-widget-content ui-corner-all");
      $.Widget.prototype.destroy.call(this);
    },
  });

  $.widget("evol.seti18n", {
    options: {},
    _create: function () {
      i18n = this.options;
    },
  });

  // - helpers to generate HTML
  var EvoUI = {
    inputRadio: function (fN, fV, fLbl, sel, fID) {
      return (
        '<label for="' +
        fID +
        '"><input id="' +
        fID +
        '" name="' +
        fN +
        '" type="radio" value="' +
        fV +
        (sel ? '" checked="checked' : "") +
        '">' +
        fLbl +
        "</label>&nbsp;"
      );
    },

    inputHidden: function (id, val) {
      return '<input type="hidden" name="' + id + '" value="' + val + '">';
    },

    inputOption: function (fID, fV) {
      return '<option value="' + fID + '">' + fV + "</option>";
    },

    optNull: '<option value=""></option>',

    inputCheckboxes: function (fLOV) {
      return fLOV
        .map(function (lv) {
          return (
            '<label for="' +
            lv.id +
            '">' +
            '<input type="checkbox" id="' +
            lv.id +
            '" value="' +
            lv.id +
            '">' +
            lv.label +
            "</label> "
          );
        })
        .join("");
    },
  };
})(jQuery);
