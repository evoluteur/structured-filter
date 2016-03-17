/*!
 * structured-filter 1.0.9
 *
 * Copyright (c) 2016, Olivier Giulieri
 *
 * https://github.com/evoluteur/structured-filter
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.button.js
 *	jquery.ui.datepicker.js
 */

(function( $, undefined){

	var evoLang={
		sEqual:'equals',
		sNotEqual:'not equal',
		sStart:'starts with',
		sContain:'contains',
		sNotContain:'doesn\'t contain',
		sFinish:'finishes with',
		sInList:'any of',
		sIsNull:'is empty',
		sIsNotNull:'is not empty',
		sBefore:'before',
		sAfter:'after',
		sNumEqual:'&#61;',
		sNumNotEqual:'!&#61;',
		sGreater:'&#62;',
		sSmaller:'&#60;',
		sOn:'on',
		sNotOn:'not on',
		sAt:'at',
		sNotAt:'not at',
		sBetween:'between',
		opAnd:'and',
		//opOr:'or',
		yes:'Yes',
		no:'No',
		bNewCond:'New filter condition',
		bAddCond:'Add condition',
		bUpdateCond:'Update condition',
		bSubmit:'Submit',
		bCancel:'Cancel'
	},
	evoAPI={
		sEqual:'eq',
		sNotEqual:'ne',
		sStart:'sw',
		sContain:'ct',
		sNotContain:'nct',
		sFinish:'fw',
		sInList:'in',
		sIsNull:'null',
		sIsNotNull:'nn',
		sGreater:'gt',
		sSmaller:'lt',
		sBetween:'bw'
	},
	fTypes={
		text:'text',
		bool:'boolean',
		number:'number',
		date:'date',
		time:'time',
		list:'list'
	},
	isNotFirefox = navigator.userAgent.toLowerCase().indexOf('firefox')===-1;

$.widget( 'evol.structFilter', {

	options: {
		fields: [],
		dateFormat: 'mm/dd/yy',
		highlight: true,
		buttonLabels: false,
		submitButton: false,
		submitReady: false
	},

	_create: function(){
		var bLabels=this.options.buttonLabels,
			that=this,
			e=this.element,
			h='<div class="evo-searchFilters"></div>'+
				'<a class="evo-bNew" href="javascript:void(0)">'+evoLang.bNewCond+'</a>';
		if(this.options.submitButton){
			h+='<a class="evo-bSubmit" href="javascript:void(0)">'+evoLang.bSubmit+'</a>';
		}
		h+='<div class="evo-editFilter"></div>'+
				'<a class="evo-bAdd" style="display:none;" href="javascript:void(0)">'+evoLang.bAddCond+'</a>'+
				'<a class="evo-bDel" style="display:none;" href="javascript:void(0)">'+evoLang.bCancel+'</a>';
		this._step=0;
		e.addClass('structFilter ui-widget-content ui-corner-all')
			.html(h);
		if(this.options.submitReady){
			this._hValues=$('<span></span>').appendTo(e);
		}
		// - button submit
		if(this.options.submitButton){
			this._bSubmit=e.find('.evo-bSubmit').button({
					text: bLabels
				}).on('click', function(e){
					that.element.trigger('submit.search');
				});
		}
		// - editor button new
		this._bNew=e.find('.evo-bNew').button({
				text: bLabels,
				icons: {secondary:'ui-icon-plusthick'}
			}).on('click', function(e){
				if(that._step<1){
					that._setEditorField();
					that._step=1;
				}
				that._bAdd.find('.ui-button-text').html(evoLang.bAddCond);
			});
		// - editor button add
		this._bAdd=e.find('.evo-bAdd').button({
				text: bLabels,
				icons: {secondary:'ui-icon-check'}
			}).on('click', function(evt){
				var data=that._getEditorData();
				if(that._cFilter){
					that._enableFilter(data, that.options.highlight);
				}else{
					that.addCondition(data);
				}
				that._removeEditor();
			});
		// - editor button cancel
		this._bDel=e.find('.evo-bDel').button({
				text: bLabels,
				icons: {secondary:'ui-icon-close'}
			}).on('click', function(evt){
				that._removeEditor();
			});
		this._editor=e.find('.evo-editFilter')
		.on('change', '#field', function(evt){
			evt.stopPropagation();
			if(that._step>2){
				that._editor.find('#value,#value2,.as-Txt').remove();
			}
			if(that._step>1){
				that._editor.find('#operator').remove();
				that._bAdd.hide();
			}
			that._step=1;
			var fieldID=$(evt.currentTarget).val();
			if(fieldID!==''){
				that._field=that._getFieldById(fieldID);
				var fType=that._type=that._field.type;
				that._setEditorOperator();
				if(fType==fTypes.list || fType==fTypes.bool){
					that._setEditorValue();
				}
			}else{
				that._field=that._type=null;
			}
		}).on('change', '#operator', function(evt){
			evt.stopPropagation();
			that._operator=$(this).val();
			if(that._step>2){
				that._editor.find('#value,#value2,.as-Txt').remove();
				that._bAdd.hide();
				that._step=2;
			}
			that._setEditorValue();
		}).on('change keyup', '#value,#value2', function(evt){
			evt.stopPropagation();
			var type=that._type,
				value=$(this).val(),
				valid=(value!=='') || type==fTypes.list || type==fTypes.bool;
			if(type==fTypes.number){
				valid=valid && !isNaN(value);
			}else if(that._operator==evoAPI.sBetween){
				valid=that._editor.find('#value').val()!=='' && that._editor.find('#value2').val()!=='';
			}
			if(valid){
				that._bAdd.button('enable');
				if(evt.which==13){
					that._bAdd.trigger('click');
				}
			}else{
				that._bAdd.button('disable');
			}
		}).on('click', '#checkAll', function(){
			var $this=$(this),
				vc=$this.prop('checked');
			allChecks=$this.siblings().prop('checked', vc);
		});
		this._filters=e.find('.evo-searchFilters').on('click', 'a', function(){
			that._editFilter($(this));
		}).on('click', 'a .ui-button-icon-secondary', function(evt){
			evt.stopPropagation();
			var filter=$(this).parent();
			if(!filter.hasClass('ui-state-disabled')){
				filter.fadeOut('slow',function(){
					filter.remove();
					that._triggerChange();
				});
			}
		});
	},

	_getFieldById: function(fId){
		if(!this._hash){
			this._hash={};
			var fields=this.options.fields;
			for (var i=0,iMax=fields.length;i<iMax;i++){
				this._hash[fields[i].id]=fields[i];
			}
		}
		return this._hash[fId];
	},

	_removeEditor: function(){
		this._editor.empty();
		this._bAdd.hide();
		this._bDel.hide();
		this._enableFilter(null, false);
		this._bNew.removeClass('ui-state-active').show();
		if(this._bSubmit){
			this._bSubmit.removeClass('ui-state-active').show();
		}
		if(isNotFirefox){
			// setting focus w/ ff takes too long
			this._bNew.focus();
		}
		this._step=0;
		this._field=this._type=this._operator=null;
	},

	addCondition: function(filter){
		var f=$('<a href="javascript:void(0)">'+this._htmlFilter(filter)+'</a>')
			.prependTo(this._filters)
			.button({
				icons: {secondary:'ui-icon-close'}
			})
			.data('filter', filter)
			.fadeIn();
		if(this.options.highlight){
			f.effect('highlight');
		}
		this._triggerChange();
		if(this._bSubmit){
			this._bSubmit.removeClass('ui-state-active').show();
		}
		return this;
	},

	removeCondition: function(index){
		this._filters.children().eq(index).remove();
		this._triggerChange();
		return this;
	},

	_htmlFilter: function(filter){
		var h='<span class="evo-lBold">'+filter.field.label+'</span> '+
			'<span class="evo-lLight">'+filter.operator.label+'</span> '+
			'<span class="evo-lBold">'+filter.value.label+'</span>';
		if(filter.operator.value==evoAPI.sBetween){
			h+='<span class="evo-lLight"> '+evoLang.opAnd+' </span>'+
				'<span class="evo-lBold">'+filter.value.label2+'</span>';
		}
		return h;
	},

	_enableFilter: function(filter, anim){
		if(this._cFilter){
			this._cFilter.button('enable').removeClass('ui-state-hover ui-state-active');
			if(anim){
				this._cFilter.effect('highlight');
			}
			if(filter){
				this._cFilter.data('filter', filter)
					.find(':first-child').html(this._htmlFilter(filter));
				this._cFilter=null;
				this._triggerChange();
			}else{
				this._cFilter=null;
			}
		}
	},

	_editFilter: function($filter){
		var filter=$filter.data('filter'),
			fid=filter.field.value,
			op=filter.operator.value,
			fv=filter.value;
		this._enableFilter(null, false);
		this._removeEditor();
		this._cFilter=$filter.button('disable');
		this._setEditorField(fid);
		this._setEditorOperator(op);
		if(op==evoAPI.sBetween){
			this._setEditorValue(fv.value, fv.value2);
		}else{
			this._setEditorValue(fv.value);
		}
		this._bAdd.find('.ui-button-text').html(evoLang.bUpdateCond);
		this._step=3;
	},

	_setEditorField: function(fid){
		if(this._step<1){
			this._bNew.stop().hide();
			if(this._bSubmit){
				this._bSubmit.stop().hide();
			}
			this._bDel.show();
			if(!this._fList){
				var fields=this.options.fields,
					h='<select id="field"><option value=""></option>';
				for (var i=0,iMax=fields.length;i<iMax;i++){
					var f=fields[i];
					h+=EvoUI.inputOption(f.id,f.label);
				}
				h+='</select>';
				this._fList=h;
			}
			$(this._fList).appendTo(this._editor).focus();
		}
		if(fid){
			this._field=this._getFieldById(fid);
			this._type=this._field.type;
			this._editor.find('#field').val(fid);
		}
		this._step=1;
	},

	_setEditorOperator: function(cond){
		var fType=this._type;
		if(this._step<2){
			var h='';
			switch (fType){
				case fTypes.list:
					//h.push(evoLang.sInList);
					h+=EvoUI.inputHidden('operator',evoAPI.sInList);
					this._operator=evoAPI.sInList;
					break;
				case fTypes.bool:
					//h.push(evoLang.sEqual);
					h+=EvoUI.inputHidden('operator',evoAPI.sEqual);
					this._operator=evoAPI.sEqual;
					break;
				default:
					h+='<select id="operator"><option value=""></option>';
					switch (fType){
						case fTypes.date:
						case fTypes.time:
							if (fType==fTypes.time){
								h+=EvoUI.inputOption(evoAPI.sEqual, evoLang.sAt)+
									EvoUI.inputOption(evoAPI.sNotEqual, evoLang.sNotAt);
							}else{
								h+=EvoUI.inputOption(evoAPI.sEqual, evoLang.sOn)+
									EvoUI.inputOption(evoAPI.sNotEqual, evoLang.sNotOn);
							}
							h+=EvoUI.inputOption(evoAPI.sGreater, evoLang.sAfter)+
								EvoUI.inputOption(evoAPI.sSmaller, evoLang.sBefore)+
								EvoUI.inputOption(evoAPI.sBetween, evoLang.sBetween);
							break;
						case fTypes.number:
							h+=EvoUI.inputOption(evoAPI.sEqual, evoLang.sNumEqual)+
								EvoUI.inputOption(evoAPI.sNotEqual, evoLang.sNumNotEqual)+
								EvoUI.inputOption(evoAPI.sGreater, evoLang.sGreater)+
								EvoUI.inputOption(evoAPI.sSmaller, evoLang.sSmaller);
							break;
						default:
							h+=EvoUI.inputOption(evoAPI.sEqual, evoLang.sEqual)+
								EvoUI.inputOption(evoAPI.sNotEqual, evoLang.sNotEqual)+
								EvoUI.inputOption(evoAPI.sStart, evoLang.sStart)+
								EvoUI.inputOption(evoAPI.sContain, evoLang.sContain)+
								EvoUI.inputOption(evoAPI.sNotContain, evoLang.sNotContain)+
								EvoUI.inputOption(evoAPI.sFinish, evoLang.sFinish);
					}
					h+=EvoUI.inputOption(evoAPI.sIsNull, evoLang.sIsNull)+
						EvoUI.inputOption(evoAPI.sIsNotNull, evoLang.sIsNotNull)+
						'</select>';
			}
			this._editor.append(h);
		}
		if(cond && fType!=fTypes.list){
			this._editor.find('#operator').val(cond);
			this._operator=cond;
		}
		this._step=2;
	},

	_setEditorValue: function( v, v2){
		var editor=this._editor,
			fType=this._type,
			opVal=editor.find('#operator').val(),
			opBetween=false,
			addOK=true;
		if(opVal!==''){
			if(fType!=fTypes.list && (opVal==evoAPI.sIsNull || opVal==evoAPI.sIsNotNull)){
				editor.append(EvoUI.inputHidden('value',''));
			}else{
				if(this._step<3){
					var h='';
					opBetween=opVal==evoAPI.sBetween;
					switch (fType){
						case fTypes.list:
							h+='<span id="value">'+
								((this._field.list.length>7)?'(<input type="checkbox" id="checkAll" value="1"/><label for="checkAll">All</label>) ':'')+
								EvoUI.inputCheckboxes(this._field.list)+
								'</span>';
							break;
						case fTypes.bool:
							h+='<span id="value">'+
								EvoUI.inputRadio('value', '1', evoLang.yes, v!='0', 'value1')+
								EvoUI.inputRadio('value', '0', evoLang.no, v=='0', 'value0')+
								'</span>';
							break;
						case fTypes.date:
						case fTypes.time:
						case fTypes.number:
							var iType=(fType==fTypes.date)?'text':fType;
							h+='<input id="value" type="'+iType+'"/>';
							if(opBetween){
								h+='<span class="as-Txt">'+evoLang.opAnd+' </span>'+
									'<input id="value2" type="'+iType+'"/>';
							}
							addOK=false;
							break;
						default:
							h+='<input id="value" type="text"/>';
							addOK=false;
					}
					editor.append(h);
					if(fType==fTypes.date){
						editor.find('#value,#value2').datepicker({dateFormat:this.options.dateFormat});
					}
				}
				if(v){
					var $value=editor.find('#value');
					switch (fType){
						case fTypes.list:
							$value.find('#'+v.split(',').join(',#')).prop('checked', 'checked');
							break;
						case fTypes.bool:
							$value.find('#value'+v).prop('checked', 'checked');
							break;
						default:
							$value.val(v);
							addOK=v!=='';
							if(opBetween){
								$value.next().next().val(v2);
								addOK=v!=='' && v2!=='';
							}
					}
				}else{
					addOK=(fType==fTypes.list || fType==fTypes.bool);
				}
			}
			this._bAdd.button(addOK?'enable':'disable').show();
			this._step=3;
		}
	},

	_getEditorData: function(){
		var e=this._editor,
			f=e.find('#field'),
			v=e.find('#value'),
			filter={
				field:{
					label: f.find('option:selected').text(),
					value: f.val()
				},
				operator:{},
				value:{}
			},
			op=filter.operator,
			fv=filter.value;
		if(this._type==fTypes.list){
			var vs=[], ls=[];
			v.find('input:checked').not('#checkAll').each(function(){
				vs.push(this.value);
				ls.push(this.nextSibling.innerHTML);
			});
			if(vs.length===0){
				op.label=evoLang.sIsNull;
				op.value=evoAPI.sIsNull;
				fv.label=fv.value='';
			}else if(vs.length==1){
				op.label=evoLang.sEqual;
				op.value=evoAPI.sEqual;
				fv.label='"'+ls[0]+'"';
				fv.value=vs[0];
			}else{
				op.label=evoLang.sInList;
				op.value=evoAPI.sInList;
				fv.label='('+ls.join(', ')+')';
				fv.value=vs.join(',');
			}
		}else if(this._type==fTypes.bool){
			op.label=evoLang.sEqual;
			op.value=evoAPI.sEqual;
			var val=(v.find('#value1').prop('checked'))?1:0;
			fv.label=(val==1)?evoLang.yes:evoLang.no;
			fv.value=val;
		}else{
			var o=e.find('#operator'),
				opVal=o.val();
			op.label=o.find('option:selected').text();
			op.value=opVal;
			if(opVal==evoAPI.sIsNull || opVal==evoAPI.sIsNotNull){
				fv.label=fv.value='';
			}else{
				if(this._type==fTypes.number || this._type==fTypes.date || this._type==fTypes.time){
					fv.label=v.val();
				}else{
					fv.label='"'+v.val()+'"';
				}
				fv.value=v.val();
				if(opVal==evoAPI.sBetween){
					fv.label2=fv.value2=v.next().next().val();
				}
			}
		}
		return filter;
	},

	_hiddenValue: function(h, filter, idx){
		h.push(EvoUI.inputHidden('fld-'+idx, filter.field.value)+
			EvoUI.inputHidden('op-'+idx, filter.operator.value)+
			EvoUI.inputHidden('val-'+idx, filter.value.value));
		var v2=filter.value.value2;
		if(v2){
			h.push(EvoUI.inputHidden('val2-'+idx, v2));
		}
	},

	_setHiddenValues: function(){
		var vs=this.val(),
			iMax=vs.length,
			h=[EvoUI.inputHidden('elem', iMax)];
		for(var i=0;i<iMax;i++){
			this._hiddenValue(h, vs[i], i+1);
		}
		//h.push('&label=',encodeURIComponent(this.valText()));
		this._hValues.html(h.join(''));
	},

	_triggerChange: function(){
		if(this.options.submitReady){
			this._setHiddenValues();
		}
		this.element.trigger('change.search');
	},

	val: function(value){
		if (typeof value=='undefined'){
		// --- get value
			var v=[];
			this._filters.find('a').each(function(){
				v.push($(this).data('filter'));
			});
			return v;
		}else{
		// --- set value
			this._filters.empty();
			for(var i=0,iMax=value.length;i<iMax;i++){
				this.addCondition(value[i]);
			}
			this._triggerChange();
			return this;
		}
	},

	valText: function(){
		var v=[];
		this._filters.find('a').each(function(){
			v.push(this.text);
		});
		return v.join(' '+evoLang.opAnd+' ');
	},

	valUrl: function(){
		var vs=this.val(),
			iMax=vs.length,
			url='filters='+iMax;
		if(iMax<1)
			return '';
		for(var i=0;i<iMax;i++){
			var v=vs[i];
			url+='&field-'+i+'='+v.field.value+
				'&operator-'+i+'='+v.operator.value+
				'&value-'+i+'='+encodeURIComponent(v.value.value);
			if(v.operator.value==evoAPI.sBetween){
				url+='&value2-'+i+'='+encodeURIComponent(v.value.value2);
			}
		}
		url+='&label='+encodeURIComponent(this.valText());
		return url;
	},

	clear: function(){
		this._cFilter=null;
		this._removeEditor();
		this._filters.empty();
		this._triggerChange();
		return this;
	},

	length: function(){
		return this._filters.children().length;
	},

	destroy: function(){
		var e=this.element.off();
		e.find('.evo-bNew,.evo-bAdd,.evo-bDel,.evo-searchFilters').off();
		this._editor.off();
		e.clear().removeClass('structFilter ui-widget-content ui-corner-all');
		$.Widget.prototype.destroy.call(this);
	}

});

var EvoUI={

	inputRadio:function(fN,fV,fLbl,sel,fID){
		return '<label for="'+fID+'"><input id="'+fID+'" name="'+fN+
			'" type="radio" value="'+fV+
			(sel?'" checked="checked':'')+
			'">'+fLbl+'</label>&nbsp;';
	},
	inputHidden:function(id,val){
		return '<input type="hidden" name="'+id+'" value="'+val+'"/>';
	},
	inputOption:function(fID,fV){
		return '<option value="'+fID+'">'+fV+'</option>';
	},
	inputCheckboxes:function(fLOV){
		var h='';
		for(var i in fLOV){
			var lv=fLOV[i];
			h+='<input type="checkbox" id="'+lv.id+'" value="'+lv.id+'"/>'+
				'<label for="'+lv.id+'">'+lv.label+'</label> ';
		}
		return h;
	}

};

})(jQuery);
