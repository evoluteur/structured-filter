/*!
 * evol.advancedSearch 0.1
 *
 * Copyright (c) 2012, Olivier Giulieri 
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.datepicker.js
 */

(function( $, undefined ) {

	var EvolLang={
		sEquals:'Equals',
		//sNotEquals:'Not equals',
		sStart:'Starts with',
		sContain:'Contains',
		sFinish:'Finishes with',
		sInList:'In list',
		sIsNull:'Is empty',
		sIsNotNull:'Is not empty',
		sBefore:'Before',
		sAfter:'After',
		sNumEqual:'&#61;',
		sNumGreater:'&#62;',
		sNumSmaller:'&#60;',
		sOn:'On',
		sAt:'At',
		//sBetween:'Between',
		opAnd:' and ',
		//opOr:' or ', 
		yes:'Yes',
		no:'No',
		bNewFilter:'New filter',
		bAddFilter:'Add filter',
		bCancel:'Cancel'
	},
	APIstr={
		sEqual:'eq',
		sStart:'sw',
		sContain:'ct',
		sFinish:'fw',
		sInList:'in',
		sIsNull:'null',
		sIsNotNull:'nn',
		sGreater:'gt',
		sSmaller:'st'
	},
	fieldTypes={ 
		text:'text',
		bool:'boolean',
		number:'number',
		date:'date',
		//time:'time',
		//datetime:'datetime',
		lov:'lov'
	} 
	 
	
$.widget( 'evol.advancedSearch', {

    options: {
		fields: [],
		dateFormat: 'mm/dd/yy',
		highlight: true
    },

    _create: function() {
		var that=this,
			e=this.element;
		this._step=0;
		this._fMaxId=0;
		e.addClass('evo-advSearch ui-widget-content ui-corner-all')
		    .html(['<div class="evo-searchFilters"></div>',
				'<a class="evo-bPlus" href="javascript:void(0)">',EvolLang.bNewFilter,'</a>',
				'<span class="evo-editFilter"></span>',
				'<a class="evo-bAdd" style="display:none;" href="javascript:void(0)">',EvolLang.bAddFilter,'</a>',
				'<a class="evo-bDel" style="display:none;" href="javascript:void(0)">',EvolLang.bCancel,'</a>'].join('')
			);
		this._bPlus=e.find('.evo-bPlus').button({
				text: false,
				icons: {secondary:'ui-icon-plusthick'}
			}).on('click', function(e){ 
				if(that._step<1){
					that._setEditorField();
					that._step=1;
				}
			});
		this._bAdd=e.find('.evo-bAdd').button({
				text: false,
				icons: {secondary:'ui-icon-check'}
			}).on('click', function(evt){
				var data=that._getEditorData();
				if(that._cFilter){
					that._enableFilter(data, that.options.highlight);
				}else{
					that.addFilter(data);
				}
				that._removeEditor();
			});
		this._bDel=e.find('.evo-bDel').button({
				text: false,
				icons: {secondary:'ui-icon-close'}
			}).on('click', function(evt){ 
				that._removeEditor();
			});		
		this._editor=e.find('.evo-editFilter')
		.on('change', '#field', function(evt){
			if(that._step>2){
				that._editor.find('#value').remove();
			}
			if(that._step>1){
				that._editor.find('#operator').remove();
				that._bAdd.hide();
			}
			that._step=1;
			var fieldID=$(evt.currentTarget).val();
			if(fieldID!=''){
				that._field=that._getFieldById(fieldID);
				var fType=that._fType=that._field.type;
				that._setEditorOperator(fType);
				if(fType==fieldTypes.lov || fType==fieldTypes.bool){
					that._setEditorValue(fType);
				}
			}else{
				that._field=null;
			}
		}).on('change', '#operator', function(evt){
			if(that._step>2){
				that._editor.find('#value').remove();
				that._bAdd.hide();
				that._step=2;
			}
			that._setEditorValue(that._fType);
		}).on('keyup', '#value', function(evt){
			var $v=$(this), v=$v.val(), ve=v!='';
			if(ve){
				that._bAdd.button('enable');
				if(evt.which==13) {
					$v.parent().next().trigger('click');
				}
			}else{
				that._bAdd.button('disable');			
			}
		}).on('click', '#checkAll', function(e){
			var vc=$(this).attr('checked'),
				allChecks=$(this).parent().children();
			if(vc=='checked'){
				allChecks.attr('checked',vc);
			}else{
				allChecks.removeAttr('checked');
			}			
		});
		this._filters=e.find('.evo-searchFilters').on('click', 'a', function(e){
			that._editFilter($(this));
		}).on('click', 'a .ui-button-icon-secondary', function(e){
			e.stopPropagation();
			var filter=$(this).parent();
			if(!filter.hasClass('ui-state-disabled')){
				filter.fadeOut('slow',function() {
					filter.remove();
				});
			}
		});
    },

	_getFieldById: function(fId) {
		var fields=this.options.fields;
		for (var i=0,iMax=fields.length;i<iMax;i++){
			if(fields[i].id==fId){
				return fields[i];
			}
		}
		return null;
	},

	_removeEditor: function() {
		this._editor.empty();
		this._bAdd.hide();
		this._bDel.hide();
		this._enableFilter(null, false);
		this._bPlus.removeClass('ui-state-active').show().focus();
		this._step=0;
		this._fType=null;
	},

	addFilter: function(filter) {
		var f=$(['<a href="javascript:void(0)">',this._htmlFilter(this._fMaxId++, filter),'</a>'].join(''))
			.prependTo(this._filters)
			.button({
				icons: {secondary:"ui-icon-close"}
			})
			.fadeIn()
		if(this.options.highlight){
			f.effect('highlight');
		}
		this.element.trigger('search.change');
		return this;
    },

	removeFilter: function(index){
		this._filters.children().eq(index).remove();
		this.element.trigger('search.change');
		return this;
	},

	_htmlFilter: function( idx, filter) {
		return [
			'<span class="evo-lBold">', filter.field.label,'</span> ',
			'<span class="evo-lLight">', filter.operator.label.toLowerCase(),'</span> ',
			' <span class="evo-lBold">', filter.value.label, '</span>',
			EvoUI.inputHidden('f-'+idx, filter.field.value),
			EvoUI.inputHidden('o-'+idx, filter.operator.value),
			EvoUI.inputHidden('v-'+idx, filter.value.value)
		].join('');
    },	

	_enableFilter: function(filter, anim) {
		if(this._cFilter){
			this._cFilter.button('enable').removeClass('ui-state-hover ui-state-active')
			if(anim){
				this._cFilter.effect('highlight');
			}
			if(filter){
				this._cFilter.find(':first-child').html(this._htmlFilter(this._fMaxId++, filter));
				this._cFilter=null;
				this.element.trigger('search.change');
			}else{
				this._cFilter=null;
			}
		}
    },

	_editFilter: function( $filter) {
		var efs=$filter.find('input[type="hidden"]');
		this._enableFilter(null, false);
		this._removeEditor();
		this._cFilter=$filter;
		var fType=this._getFieldById(efs[0].value).type;
	    this._setEditorField(efs[0].value);
        this._setEditorOperator(fType, efs[1].value);
        this._setEditorValue(fType, efs[2].value);
		$filter.button('disable');
        this._step=3;
	},

	_setEditorField: function(fid) {
		if(this._step<1){
			var fields=this.options.fields,
				h=[];
			h.push('<select id="field"><option value=""></option>'); 
			for (var i=0,iMax=fields.length;i<iMax;i++){
				var f=fields[i];
				h.push('<option value="',f.id,'">',f.label,'</option>');
			}
			h.push('</select>');
			this._bPlus.stop().hide();
			this._bDel.show();
			this._editor.append(h.join(''))
				.find('#field').focus();
		}
		if(fid){
			this._field=this._getFieldById(fid);
			this._fType=this._field.type;
		    this.element.find('#field').val(fid); 
		}
		this._step=1;
    },

	_setEditorOperator: function(fType, cond) {
		if(this._step<2){
			var h=[]; 
			switch (fType) {
				case fieldTypes.lov:
					//h.push(EvolLang.sInList);
					h.push(EvoUI.inputHidden('operator',APIstr.sInList));
					break;
				case fieldTypes.bool:
					//h.push(EvolLang.sEquals);
					h.push(EvoUI.inputHidden('operator',APIstr.sEqual));
					break;
				default: 
					h.push('<select id="operator">');
					h.push('<option value=""></option>');
					switch (fType) {
						case fieldTypes.date:
						case fieldTypes.datetime:
						case fieldTypes.time:
							if (fType==fieldTypes.time){
								h.push(EvoUI.inputOption(APIstr.sEqual, EvolLang.sAt));
							}else{
								h.push(EvoUI.inputOption(APIstr.sEqual, EvolLang.sOn));
							}
							h.push(EvoUI.inputOption(APIstr.sGreater, EvolLang.sAfter))
							h.push(EvoUI.inputOption(APIstr.sSmaller, EvolLang.sBefore));
							break;
						case fieldTypes.number:
							h.push(EvoUI.inputOption(APIstr.sEqual, EvolLang.sNumEqual),
								EvoUI.inputOption(APIstr.sGreater, EvolLang.sNumGreater),
								EvoUI.inputOption(APIstr.sSmaller, EvolLang.sNumSmaller)
							);
							break;
						default:
							h.push(EvoUI.inputOption(APIstr.sEqual, EvolLang.sEquals),
								EvoUI.inputOption(APIstr.sStart, EvolLang.sStart),
								EvoUI.inputOption(APIstr.sContain, EvolLang.sContain),
								EvoUI.inputOption(APIstr.sFinish, EvolLang.sFinish)
							); 
							break;
					}
					h.push(EvoUI.inputOption(APIstr.sIsNull, EvolLang.sIsNull));
					h.push(EvoUI.inputOption(APIstr.sIsNotNull, EvolLang.sIsNotNull));
					h.push("</select>");
					break;
			} 
			this._editor.append(h.join(''));
		}
		if(cond && fType!=fieldTypes.lov){
		    this._editor.find('#operator').val(cond); 
		}
		this._step=2;
    },

	_setEditorValue: function( fType, v) {
		var editor=this._editor,
			opVal=editor.find('#operator').val(),
			canAdd=true;
		if(opVal!=''){
			if(fType!=fieldTypes.lov && (opVal==APIstr.sIsNull || opVal==APIstr.sIsNotNull)){
				editor.append(EvoUI.inputHidden('value',''));
			}else{
				if(this._step<3){
					var h=[];
					switch (fType) {
						case fieldTypes.lov:
							h.push('<span id="value">');
							if(this._field.list.length>7){
								h.push('(<input type="checkbox" id="checkAll" value="1"/>');
								h.push('<label for="checkAll">All</label>) ');
							}
							h.push(EvoUI.inputCheckboxLOV(this._field.list));
							h.push('</span>');
							break;
						case fieldTypes.bool:
							h.push('<span id="value">',
								EvoUI.inputRadio('value', '1', EvolLang.yes, true, 'value1'),
								EvoUI.inputRadio('value', '0', EvolLang.no, false, 'value0'),
								'</span>');
							break;
						case fieldTypes.number:
							h.push('<input id="value" type="number"/>');
							canAdd=false;
							break;
						default:
							h.push('<input id="value" type="text"/>');
							canAdd=false;
							break;
					}
					editor.append(h.join(''));
					if(fType!=fieldTypes.bool){
						var $value=editor.find('#value');
						if(fType==fieldTypes.date){
							$value.datepicker({dateFormat:this.options.dateFormat});
						}
					}
				}
				if(v){
					var $value=editor.find('#value');
					switch (fType) {
						case fieldTypes.lov:
							$value.find('#'+v.split(',').join(',#')).attr("checked", "checked");
							break;
						case fieldTypes.bool:
							$value.find('#value'+v).attr("checked", "checked");
							break;
						default:
							$value.val(v);
							canAdd=v!='';
							break;
					}
				}else{
					canAdd=(fType==fieldTypes.lov || fType==fieldTypes.bool);
				}
			}
			if(canAdd){
				this._bAdd.button('enable').show(); 
			}else{
				this._bAdd.button('disable').show(); 
			}
			this._step=3;
		}
    },

	_getEditorData: function() {
		var e=this._editor,
			f=e.find('#field'),
			o=e.find('#operator'),
			v=e.find('#value'),
			filter = {
				field:{
					label: f.find('option:selected').text(),
					value: f.val()
				},
				operator:{},
				value:{}
			};
		if(this._fType==fieldTypes.lov){
			var vs=[], ls=[]; 
			v.find('input:checked').not('#checkAll').each(function(){
				vs.push(this.value);
				ls.push(this.nextSibling.innerHTML);
			});
			if(vs.length==0){
				filter.operator.label=EvolLang.sIsNull;
				filter.operator.value=APIstr.sIsNull;
				filter.value.label=filter.value.value='';
			}else if(vs.length==1){
				filter.operator.label=EvolLang.sEquals;
				filter.operator.value=APIstr.sEquals;
				filter.value.label='"'+ls[0]+'"';
				filter.value.value=vs[0];
			}else{
				filter.operator.label=EvolLang.sInList;
				filter.operator.value=APIstr.sInList;
				filter.value.label='('+ls.join(', ')+')';
				filter.value.value=vs.join(',');
			}
		}else if(this._fType==fieldTypes.bool){
			filter.operator.label=EvolLang.sEquals;
			filter.operator.value=APIstr.sEqual;
			var val=(v.find('#value1').attr('checked')=='checked')?1:0;
			filter.value.label=(val==1)?EvolLang.yes:EvolLang.no;
			filter.value.value=val;
		}else{
			var opVal=o.val();
			filter.operator.label=o.find('option:selected').text();
			filter.operator.value=opVal;
			if(opVal==APIstr.sIsNull || opVal==APIstr.sIsNotNull){
				filter.value.label=filter.value.value='';
			}else{
				if(this._fType==fieldTypes.number){
					filter.value.label=v.val();
				}else{
					filter.value.label='"'+v.val()+'"';
				}
				filter.value.value=v.val();
			}
		} 
		return filter;
    },

	val: function(value) {
		if (typeof value=='undefined') { 
		// --- get value
			var v=[];
			this._filters.find('a').each(function(){
				var vf={label:this.innerText},
					w=$(this).find('input:first');
				vf.field=w.val();
				w=w.next();
				vf.operator=w.val();
				w=w.next();
				vf.value=w.val();
				v.push(vf);			
			})
			return v;
		}else{ 
		// --- set value
			this._filters.empty();
			for(var i=0,iMax=value.length;i<iMax;i++){
				this.addFilter(value[i]);
			}
			this.element.trigger('search.change');
			return this;
		}
    },

	valText: function() {
		var v=[];
		this._filters.find('a').each(function(){ 
			v.push(this.innerText);
		})
		return v.join(EvolLang.opAnd);
    },

	valUrl: function() {
		var vs=this.val(),
			iMax=vs.length,
			url=['elem=',iMax];
		for(var i=0;i<iMax;i++){
			var v=vs[i];
			url.push(
				'&field-',i,'=',v.field,
				'&operator-',i,'=',v.operator,
				'&value-',i,'=',encodeURIComponent(v.value)
			);
		}
		url.push('&label=',encodeURIComponent(this.valText()));
		return url.join('');
    },

	empty: function() {
		this._cFilter=null;
		this._removeEditor();
		this._filters.empty();
		this.element.trigger('search.change');
		return this;
    },

	length: function() {
		return this._filters.children().length;
	},

    destroy: function() {
		var e=this.element.off();
		e.find('.evo-bPlus,.evo-bAdd,.evo-bDel,.evo-searchFilters').off();
		e.empty().removeClass('evo-advSearch ui-widget-content ui-corner-all');
        $.Widget.prototype.destroy.call(this);
    }

});

var EvoUI={

	inputRadio:function(fN,fV,fLbl,sel,fID){
		var fh=['<label for="',fID,'"><input ID="',fID,'" name="',fN,'" type="radio" value="',fV,'"'];
		if(sel){
			fh.push(' checked="checked"');
		}
		fh.push('">',fLbl,"</label>&nbsp;");
		return fh.join('');
	},
	inputHidden:function( id, val){
		return ['<input type="hidden" name="',id,'" id="',id,'" value="',val,'"/>'].join('');
	},
	inputOption:function(fID,fV){
		return ['<option value="',fID,'">',fV,'</option>'].join('');
	},
	inputCheckboxLOV:function(fLOV){
		var h=[]; 
		for(var i in fLOV){
			var lv=fLOV[i];
			h.push('<input type="checkbox" id="',lv.id,'" value="',lv.id,'"/>');
			h.push('<label for="',lv.id,'">',lv.label,'</label> ');
		}
		return h.join('');
	}

}

})(jQuery);

