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

	var evoLang={
		sEqual:'equals',
		sNotEqual:'not equal',
		sStart:'starts with',
		sContain:'contains',
		sFinish:'finishes with',
		sInList:'in list',
		sIsNull:'is empty',
		sIsNotNull:'is not empty',
		sBefore:'before',
		sAfter:'after',
		sNumEqual:'&#61;',
		sNumNotEqual:'!&#61;',
		sNumGreater:'&#62;',
		sNumSmaller:'&#60;',
		sOn:'on',
		sNotOn:'not on',
		//sAt:'at',
		sBetween:'between',
		opAnd:'and',
		//opOr:'or', 
		yes:'Yes',
		no:'No',
		bNewFilter:'New filter',
		bAddFilter:'Add filter',
		bCancel:'Cancel'
	},
	evoAPI={
		sEqual:'eq',
		sNotEqual:'neq',
		sStart:'sw',
		sContain:'ct',
		sFinish:'fw',
		sInList:'in',
		sIsNull:'null',
		sIsNotNull:'nn',
		sGreater:'gt',
		sSmaller:'st',
		sBetween:'bw'
	},
	evoTypes={ 
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
				'<a class="evo-bPlus" href="javascript:void(0)">',evoLang.bNewFilter,'</a>',
				'<span class="evo-editFilter"></span>',
				'<a class="evo-bAdd" style="display:none;" href="javascript:void(0)">',evoLang.bAddFilter,'</a>',
				'<a class="evo-bDel" style="display:none;" href="javascript:void(0)">',evoLang.bCancel,'</a>'].join('')
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
				if(fType==evoTypes.lov || fType==evoTypes.bool){
					that._setEditorValue(fType);
				}
			}else{
				that._field=null;
			}
		}).on('change', '#operator', function(evt){
			that._operator=$(this).val();
			if(that._step>2){
				that._editor.find('#value,#value2,#valueSep').remove();
				that._bAdd.hide();
				that._step=2;
			}
			that._setEditorValue(that._fType);
		}).on('change keyup', '#value,#value2', function(evt){
			var type=that._fType,
				value=$(this).val(),
				valid=(value!='') || type==evoTypes.lov || type==evoTypes.bool; 
			if(that._operator==evoAPI.sBetween){
				valid=that._editor.find('#value').val()!='' && that._editor.find('#value2').val()!=''
			}
			if(valid){
				that._bAdd.button('enable');
				if(evt.which==13) {
					this._bAdd.trigger('click');
				}
			}else{
				that._bAdd.button('disable');			
			}
		}).on('click', '#checkAll', function(e){
			var $this=$(this),
				vc=$this.attr('checked'),
				allChecks=$this.parent().children();
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
		if(!this._hash){
			this._hash={};
			var fields=this.options.fields;
			for (var i=0,iMax=fields.length;i<iMax;i++){
				this._hash[fields[i].id]=fields[i];
			}
		}
		return this._hash[fId];
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
		var h=[
			'<span class="evo-lBold">', filter.field.label,'</span> ',
			'<span class="evo-lLight">', filter.operator.label,'</span> ',
			' <span class="evo-lBold">', filter.value.label, '</span>',
			EvoUI.inputHidden('f-'+idx, filter.field.value),
			EvoUI.inputHidden('o-'+idx, filter.operator.value),
			EvoUI.inputHidden('v-'+idx, filter.value.value)
		];
		if(filter.operator.value==evoAPI.sBetween){
			h.push('<span class="evo-lLight"> ', evoLang.opAnd, ' </span>');
			h.push('<span class="evo-lBold">', filter.value.label2, '</span>');
			h.push(EvoUI.inputHidden('v2-'+idx, filter.value.value2));
		}
		return h.join('');
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
        if(efs[1].value==evoAPI.sBetween){
			this._setEditorValue(fType, efs[2].value, efs[3].value);
        }else{
			this._setEditorValue(fType, efs[2].value);
        }
        
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
				case evoTypes.lov:
					//h.push(evoLang.sInList);
					h.push(EvoUI.inputHidden('operator',evoAPI.sInList));
					break;
				case evoTypes.bool:
					//h.push(evoLang.sEqual);
					h.push(EvoUI.inputHidden('operator',evoAPI.sEqual));
					break;
				default: 
					h.push('<select id="operator">');
					h.push('<option value=""></option>');
					switch (fType) {
						case evoTypes.date:
						//case evoTypes.datetime:
						//case evoTypes.time:
							//if (fType==evoTypes.time){
							//	h.push(EvoUI.inputOption(evoAPI.sEqual, evoLang.sAt));
							//}else{
								h.push(EvoUI.inputOption(evoAPI.sEqual, evoLang.sOn));
								h.push(EvoUI.inputOption(evoAPI.sNotEqual, evoLang.sNotOn));
							//}
							h.push(EvoUI.inputOption(evoAPI.sGreater, evoLang.sAfter),
								EvoUI.inputOption(evoAPI.sSmaller, evoLang.sBefore),
								EvoUI.inputOption(evoAPI.sBetween, evoLang.sBetween)
							)
							break;
						case evoTypes.number:
							h.push(EvoUI.inputOption(evoAPI.sEqual, evoLang.sNumEqual),
								EvoUI.inputOption(evoAPI.sNotEqual, evoLang.sNumNotEqual),
								EvoUI.inputOption(evoAPI.sGreater, evoLang.sNumGreater),
								EvoUI.inputOption(evoAPI.sSmaller, evoLang.sNumSmaller)
							);
							break;
						default:
							h.push(EvoUI.inputOption(evoAPI.sEqual, evoLang.sEqual),
								EvoUI.inputOption(evoAPI.sNotEqual, evoLang.sNotEqual),
								EvoUI.inputOption(evoAPI.sStart, evoLang.sStart),
								EvoUI.inputOption(evoAPI.sContain, evoLang.sContain),
								EvoUI.inputOption(evoAPI.sFinish, evoLang.sFinish)
							); 
							break;
					}
					h.push(EvoUI.inputOption(evoAPI.sIsNull, evoLang.sIsNull));
					h.push(EvoUI.inputOption(evoAPI.sIsNotNull, evoLang.sIsNotNull));
					h.push("</select>");
					break;
			} 
			this._editor.append(h.join(''));
		}
		if(cond && fType!=evoTypes.lov){
		    this._editor.find('#operator').val(cond); 
		}
		this._step=2;
    },

	_setEditorValue: function( fType, v, v2) {
		var editor=this._editor,
			opVal=editor.find('#operator').val(),
			addOK=true;
		if(opVal!=''){
			if(fType!=evoTypes.lov && (opVal==evoAPI.sIsNull || opVal==evoAPI.sIsNotNull)){
				editor.append(EvoUI.inputHidden('value',''));
			}else{
				if(this._step<3){
					var h=[],
						opBetween=opVal==evoAPI.sBetween;
					switch (fType) {
						case evoTypes.lov:
							h.push('<span id="value">');
							if(this._field.list.length>7){
								h.push('(<input type="checkbox" id="checkAll" value="1"/>');
								h.push('<label for="checkAll">All</label>) ');
							}
							h.push(EvoUI.inputCheckboxLOV(this._field.list));
							h.push('</span>');
							break;
						case evoTypes.bool:
							h.push('<span id="value">',
								EvoUI.inputRadio('value', '1', evoLang.yes, true, 'value1'),
								EvoUI.inputRadio('value', '0', evoLang.no, false, 'value0'),
								'</span>');
							break;
						case evoTypes.date:
						case evoTypes.number:	
							var iType=(fType==evoTypes.date)?'text':'number';
							h.push('<input id="value" type="',iType,'"/>');
							if(opBetween){
								h.push('<span id="valueSep">',evoLang.opAnd,' </span>');
								h.push('<input id="value2" type="',iType,'"/>');
							}
							addOK=false;
							break;
						default:
							h.push('<input id="value" type="text"/>');
							addOK=false;
							break;
					}
					editor.append(h.join(''));
					if(fType==evoTypes.date){
						editor.find('#value,#value2').datepicker({dateFormat:this.options.dateFormat});
					}
				}
				if(v){
					var $value=editor.find('#value');
					switch (fType) {
						case evoTypes.lov:
							$value.find('#'+v.split(',').join(',#')).attr("checked", "checked");
							break;
						case evoTypes.bool:
							$value.find('#value'+v).attr("checked", "checked");
							break;
						default:
							$value.val(v);
							addOK=v!='';
							if(opBetween){
								$value.next().next().val(v2);
								addOK=v!='' && v2!='';
							}
					}
				}else{
					addOK=(fType==evoTypes.lov || fType==evoTypes.bool);
				}
			}
			if(addOK){
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
			v=e.find('#value'),
			filter = {
				field:{
					label: f.find('option:selected').text(),
					value: f.val()
				},
				operator:{},
				value:{}
			};
		if(this._fType==evoTypes.lov){
			var vs=[], ls=[]; 
			v.find('input:checked').not('#checkAll').each(function(){
				vs.push(this.value);
				ls.push(this.nextSibling.innerHTML);
			});
			if(vs.length==0){
				filter.operator.label=evoLang.sIsNull;
				filter.operator.value=evoAPI.sIsNull;
				filter.value.label=filter.value.value='';
			}else if(vs.length==1){
				filter.operator.label=evoLang.sEqual;
				filter.operator.value=evoAPI.sEqual;
				filter.value.label='"'+ls[0]+'"';
				filter.value.value=vs[0];
			}else{
				filter.operator.label=evoLang.sInList;
				filter.operator.value=evoAPI.sInList;
				filter.value.label='('+ls.join(', ')+')';
				filter.value.value=vs.join(',');
			}
		}else if(this._fType==evoTypes.bool){
			filter.operator.label=evoLang.sEqual;
			filter.operator.value=evoAPI.sEqual;
			var val=(v.find('#value1').attr('checked')=='checked')?1:0;
			filter.value.label=(val==1)?evoLang.yes:evoLang.no;
			filter.value.value=val;
		}else{
			var o=e.find('#operator'),
				opVal=o.val();
			filter.operator.label=o.find('option:selected').text();
			filter.operator.value=opVal;
			if(opVal==evoAPI.sIsNull || opVal==evoAPI.sIsNotNull){
				filter.value.label=filter.value.value='';
			}else{
				if(this._fType==evoTypes.number || this._fType==evoTypes.date){
					filter.value.label=v.val();
				}else{
					filter.value.label='"'+v.val()+'"';
				}
				filter.value.value=v.val();
				if(opVal==evoAPI.sBetween){
					filter.value.label2=filter.value.value2=v.next().next().val();
				}
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
					w=$(this).find('input');
				vf.field=w.eq(0).val();
				vf.operator=w.eq(1).val();
				vf.value=w.eq(2).val();
				if(vf.operator==evoAPI.sBetween){
					vf.value2=w.eq(3).val();
				}
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
		return v.join(' '+evoLang.opAnd+' ');
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
			if(v.operator==evoAPI.sBetween){
				url.push('&value2-',i,'=',encodeURIComponent(v.value));
			}

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
		this._editor.off();
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
	inputHidden:function(id,val){
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

