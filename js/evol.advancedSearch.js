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
		no:'No'
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
        fields: []
    },

    _create: function() {
		var that=this,
			e=this.element;
		this._step=0;
		this._fMaxId=0;
		e.addClass('advSearch ui-widget-content ui-corner-all')
		    .html(['<div class="searchFilters"></div>',
				'<a class="bPlus" href="javascript:void(0)">New filter</a>',
				'<span class="editFilter"></span>',
				'<a class="bAdd" style="display:none;" href="javascript:void(0)">Add condition</a>',
				'<a class="bDel" style="display:none;" href="javascript:void(0)">Cancel</a>'].join('')
			);
		this._editSpan=e.find('.editFilter');
		e.find('.bPlus').button({
				text: false,
				icons: {secondary:'ui-icon-plusthick'}
			}).on('click', function(e){ 
				if(that._step<1){
					that._setFilterField();
					that._step=1;
				}
			});
		e.find('.bAdd').button({
				text: false,
				icons: {secondary:'ui-icon-check'}
			}).on('click', function(evt){
				if(that._cFilter){
					that._enableFilterTag(that._htmlFilter(that._fMaxId++, that._jsonFilter()));
				}else{
					that.addFilter( that._jsonFilter());
				}
				that._removeFilterEditor();
			});
		e.find('.bDel').button({
				text: false,
				icons: {secondary:'ui-icon-close'}
			}).on('click', function(evt){ 
				that._removeFilterEditor();
			});
		e.on('change', '#field', function(evt){
			if(that._step>2){
				e.find('#value').remove();
			}
			if(that._step>1){
				e.find('#operator').remove();
			}
			that._step=1;
			var fieldID=$(evt.currentTarget).val();
			if(fieldID!=''){
				that._field=that._getFieldById(fieldID)
				var fType=that._fType=that._field.type;
				that._setFilterOperator(fType);
				if(fType==fieldTypes.lov || fType==fieldTypes.bool){
					that._setFilterValue(fType);
				}
			}else{
				that._field=null;
			}
		}).on('change', '#operator', function(evt){
			if(that._step>2){
				e.find('#value').remove();
				that._step=2;
			}
			that._setFilterValue(that._fType);
		}).on('click', '.searchFilters a', function(e){
			var $this=$(this),
				efs=$this.find('input[type="hidden"]');
			if(that._cFilter){
				that._enableFilterTag();
			}
			that._removeFilterEditor();
			that._cFilter=$this;
			that._showFilter(efs[0].value, efs[1].value, efs[2].value);
			$this.button('disable');
		}).on('click', '.searchFilters a .ui-button-icon-secondary', function(e){
			e.stopPropagation();
			var filter=$(this).parent();
			if(!filter.hasClass('ui-state-disabled')){
				filter.fadeOut('slow',function() {
					filter.remove();
				});
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

	_removeFilterEditor: function() {
		var p=this._editSpan.empty().parent();
		p.find('.bAdd,.bDel').hide();
		p.find('.bPlus').removeClass('ui-state-active').show().focus();
		this._step=0;
		this._enableFilterTag();
	},

	addFilter: function(filterData) {
		var that=this;
		$(['<a href="javascript:void(0)">',this._htmlFilter(this._fMaxId++, filterData),'</a>'].join(''))
			.prependTo(this.element.find('div:first'))
			.button({
				icons: {secondary:"ui-icon-close"}
			})
			.fadeIn();
		return this;
    },

	removeFilter: function(index){
		this.element.find('div:first').children().eq(index).remove();
		return this;
	},

	_jsonFilter: function() {
		var e=this._editSpan,
			f=e.find('#field'),
			o=e.find('#operator'),
			v=e.find('#value'),
			filterData = {
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
			filterData.operator.label=EvolLang.sInList;
			filterData.operator.value=APIstr.sInList;
			filterData.value.label='(' + ls.join(', ') + ')';
			filterData.value.value=vs.join(',')
		}else if(this._fType==fieldTypes.bool){
			filterData.operator.label=EvolLang.sEquals;
			filterData.operator.value=APIstr.sEqual;
			var val=(v.find('#value1').attr('checked')=='checked')?1:0;
			filterData.value.label=(val==1)?EvolLang.yes:EvolLang.no;
			filterData.value.value=val;
		}else{
			filterData.operator.label=o.find('option:selected').text();
			var opVal=o.val();
			filterData.operator.value=opVal;
			if(opVal==APIstr.sIsNull || opVal==APIstr.sIsNotNull){
				filterData.value.label=filterData.value.value='';
			}else{
				if(this._fType==fieldTypes.number){
					filterData.value.label=v.val();
				}else{
					filterData.value.label='"'+v.val()+'"';
				}
				filterData.value.value=v.val();
			}
		} 
		return filterData;
    },

	_htmlFilter: function( idx, filterData) {
		return [
			'<span class="lBold">', filterData.field.label,'</span> ',
			'<span class="lLight">', filterData.operator.label.toLowerCase(),'</span> ',
			' <span class="lBold">', filterData.value.label, '</span>',
			EvoUI.inputHidden('f-'+idx, filterData.field.value),
			EvoUI.inputHidden('o-'+idx, filterData.operator.value),
			EvoUI.inputHidden('v-'+idx, filterData.value.value)
		].join('');
    },	

	_enableFilterTag: function(html) {
		if(this._cFilter){
			if(html){
				this._cFilter.find(':first-child').html(html);
			}
			this._cFilter.button('enable').removeClass('ui-state-hover ui-state-active');
			this._cFilter=null;
		}
    },

	_showFilter: function( f, o, v) {
		var fType=this._getFieldById(f).type;
	    this._setFilterField(f);
        this._setFilterOperator(fType, o);
        this._setFilterValue(fType, v);
        this._step=3;
	},

	_setFilterField: function(fid) {
		if(this._step<1){
			var fields=this.options.fields,
				h=[];
			h.push('<select id="field"><option value=""></option>'); 
			for (var i=0,iMax=fields.length;i<iMax;i++){
				var f=fields[i];
				h.push('<option value="',f.id,'">',f.label,'</option>');
			}
			h.push('</select>');
			var p=this._editSpan.append(h.join('')).parent();
			p.find('.bPlus').stop().hide();
			p.find('.bDel').fadeIn();
			p.find('#field').focus();
		}
		if(fid){
			this._field=this._getFieldById(fid);
			this._fType=this._field.type;
		    this.element.find('#field').val(fid); 
		}
		this._step=1;
    },

	_setFilterOperator: function(fType, cond) {
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
			this._editSpan.append(h.join(''));
		}
		if(cond){
		    this.element.find('#operator').val(cond); 
		}
		this._step=2;
    },

	_setFilterValue: function( fType, v) {
		var editor=this._editSpan,
			opVal=editor.find('#operator').val();
		if(opVal!=''){
			if(opVal==APIstr.sIsNull || opVal==APIstr.sIsNotNull){
				editor.append(EvoUI.inputHidden('value',''));
			}else{
				if(this._step<3){
					var h=[];
					switch (fType) {
						case fieldTypes.lov:
							h.push('<span id="value">');
							if(this._field.list.length>7){
								h.push('(<input type="checkbox" id="checkAll" value="1">');
								h.push('<label for="checkAll">All</label>) ');
							}
							h.push(EvoUI.inputCheckboxLOV(this._field.list));
							h.push('</span>');
							break;
						case fieldTypes.bool:
							h.push('<span id="value">');
							h.push(EvoUI.inputRadio('value', '1', EvolLang.yes, false, 'value1'));
							h.push(EvoUI.inputRadio('value', '0', EvolLang.no, false, 'value0'));
							h.push('</span>');
							break;
						case fieldTypes.number:
							h.push('<input id="value" type="number">');
							break;
						default:
							h.push('<input id="value" type="text">');
							break;
					}
					editor.append(h.join(''));
					if(fType!=fieldTypes.bool){
						var $value=editor.find('#value');
						if(fType==fieldTypes.date){
							$value.datepicker();
						}
						$value.on('keyup', function(evt){
							if (evt.which == 13) {
								$(this).parent().next().trigger('click');
							}
						})
					}
				}
				if(v){
					var p=editor.find('#value');
					switch (fType) {
						case fieldTypes.lov:
							p.find('#'+v.split(',').join(',#')).attr("checked", "checked");
							break;
						case fieldTypes.bool:
							p.find('#value'+v).attr("checked", "checked");
							break;
						default:
							p.val(v);
							break;
					}
				}
			}
			this.element.find('.bAdd').fadeIn(); 
			this._step=3;
		}
    },

	val: function(value) {
		var tags=this.element.find('div:first a');
		if (typeof value=='undefined') { 
		// --- get value
			var v=[];
			tags.each(function(){
				var $this=$(this),
					vf={label:this.innerText},
					w=$this.find('input:first');
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
			tags.empty();
			for(var i=0,iMax=value.length;i<iMax;i++){
				this.addFilter(value[i]);
			}
			return this;
		}
    },

	valText: function() {
		var v=[];
		this.element.find('div:first a').each(function(){ 
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
		return url.join('');
    },

	empty: function() {
		this._cFilter=null;
		this._removeFilterEditor();
		this.element.find('div:first a');
		return this;
    },

    destroy: function() {
		var e=this.element.off('change click');
		e.find('.bPlus,.bAdd,.bDel').off('click');
		e.empty().removeClass('structuredSearch ui-widget-content ui-corner-all');
        $.Widget.prototype.destroy.call(this);
    }

});


var EvoUI={

	inputText:function(fID,fV){
		return ['<input type="text" name="',fID,'" id="',fID,'" value="',fV,'">'].join('');
	},
	inputTextInt:function(fID,fV,fT,max,min){
		return ['<input type="text" name="',fID,'" id="',fID,'" value="',fV,
			'" onKeyUp="EvoVal.checkNum(this,\'',fT,'\')" class="Field" maxlength="12">'].join('');
	},
	inputCheckbox:function(fID,fV){
		var fh=['<input type="checkbox" id="',fID,'"'];
		if(fV!=null&&fV!=''&&fV!='0'){
			fh.push(' checked');
		}
		fh.push(' value="1">');
		return fh.join("");
	},
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
		var fh=[]; 
		for(var i in fLOV){
			var lv=fLOV[i];
			fh.push('<input type="checkbox" id="',lv.id,'" value="',lv.id,'">');
			fh.push('<label for="',lv.id,'">',lv.label,'</label> ');
		}
		return fh.join('');
	}

}

})(jQuery);

