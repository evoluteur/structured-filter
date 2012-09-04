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
		sGreaterThan:'gt',
		sSmallerThan:'st'
	},
	fieldTypes={ 
		text:'text',
		bool:'boolean',
		dec:'decimal',
		integer:'integer',
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
		var h=[],
			that=this,
			opts=this.options,
			e=this.element;
		this._step=0;
		this._fMaxId=0;
		h.push('<div class="searchFilters"></div>');
		h.push('<a class="bPlus" href="javascript:void(0)">New filter</a><span class="editFilter"></span>');
		h.push('<a class="bAdd" style="display:none;" href="javascript:void(0)">Add condition</a>');
		h.push('<a class="bDel" style="display:none;" href="javascript:void(0)">Cancel</a>');
		e.addClass('structuredSearch ui-widget-content ui-corner-all')
		    .html(h.join(''));
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
				that._step=0;  
				that.addFilter( that._jsonFilterDef());
				that._removeFilterEditor();
				//that.trigger('filteradd');
			});
		e.find('.bDel').button({
				text: false,
				icons: {secondary:'ui-icon-close'}
			}).on('click', function(evt){ 
				that._removeFilterEditor();
			});
		e.find('#field').live('change', function(evt){
				if(that._step>2){
					e.find('#value').remove();
				}
				if(that._step>1){
					e.find('#operator').remove();
				}
				that._step=1;
				that._field=that._getFieldById($(evt.currentTarget).val())
				var fType=that._field.type;
				that._setFilterOperator(fType);
				if(fType==fieldTypes.lov || fType==fieldTypes.bool){
					that._setFilterValue(fType);
				}
				that._fType=fType;
			});
		e.find('#operator').live('change', function(evt){
				if(that._step>2){
					e.find('#value').remove();
					that._step=2;
				}
				that._setFilterValue(that._fType);
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
		var p=this.element.find('.editFilter').empty().parent();
		p.find('.bAdd,.bDel').hide();
		p.find('.bPlus').fadeIn();	
		this._step=0; 
		if(this._cFilterTag){
			this._cFilterTag.button('enable').removeClass('ui-state-hover');
			this._cFilterTag=null;
		}
		//this.trigger('filterremove');		
	},
	
	addFilter: function(filterData) {
		var idx=this._fMaxId++,
			html=this._htmlFilter(idx, filterData)
		if(this._cFilterTag){
			this._cFilterTag.button('enable').removeClass('ui-state-hover');
			this._enableFilterTag(html);
		}else{
			var that=this;
			$(['<a data-type="',this._fType,'">',html,'</a>'].join('')).prependTo(this.element.find('div:first'))
				.button({
					icons: { secondary: "ui-icon-close" }
				})
				.click(function(e){ 
					var $this=$(this),
						efs=$this.find('input[type="hidden"]');
					if(that._cFilterTag){
						that._enableFilterTag();
					}
					that._removeFilterEditor();
					that._cFilterTag=$this;
					that._showFilter(efs[0].value, efs[1].value, efs[2].value);
					$this.button('disable');
				})
				.fadeIn() 
				.find('.ui-button-icon-secondary').click(function(e){
					e.stopPropagation();
					var filter=$(this).parent();
					if(!filter.hasClass('ui-state-disabled')){
						filter.fadeOut('slow',function() {
							filter.remove();
						});
					}
				})
		}
		return this;
    },

	removeFilter: function(index){
		this.element.find('div:first').children().eq(index).remove();
		return this;
	},

	_jsonFilterDef: function() {
		var e=this.element.find('.editFilter'),
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
			this.element.find('#value').find('input:checked').each(function(){
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
				filterData.value.label='"' + v.val() + '"';
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
		if(this._cFilterTag){
			if(html){
				this._cFilterTag.find(':first-child').html(html);
			}
			this._cFilterTag.button('enable').removeClass('ui-state-hover');
			this._cFilterTag=null;
		}
    },
	
	_showFilter: function( f, o, v) {
		var fType = this._getFieldById(f).type;
	    this._setFilterField(f);
        this._setFilterOperator(fType, o);
        this._setFilterValue(fType, v);
        this._step=3;
	},
	
	_setFilterField: function(fid) {
		if(this._step<1){
			var fields=this.options.fields,
				h=[];
			h.push('<select class="evolField" id="field"><option value=""></option>'); 
			for (var i=0,iMax=fields.length;i<iMax;i++){
				var f=fields[i];
				h.push('<option value="',f.id,'">',f.label,'</option>');
			}
			h.push('</select>'); 
			var p=this.element.find('.editFilter').append(h.join('')).parent();
			p.find('.bPlus').hide();
			p.find('.bDel').fadeIn();	
		}
		if(fid){
			this._field=this._getFieldById(fid);
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
							h.push(EvoUI.inputOption(APIstr.sGreaterThan, EvolLang.sAfter))
							h.push(EvoUI.inputOption(APIstr.sSmallerThan, EvolLang.sBefore));
							if (this.required!='1'){
								h.push(EvoUI.inputOption(APIstr.sIsNull, EvolLang.sIsNull));
								h.push(EvoUI.inputOption(APIstr.sIsNotNull, EvolLang.sIsNotNull));
							}
							break;
						case fieldTypes.dec:
						case fieldTypes.integer:	
							h.push(EvoUI.inputOption(APIstr.sEqual, EvolLang.sNumEqual));
							h.push(EvoUI.inputOption(APIstr.sGreaterThan, EvolLang.sNumGreater));
							h.push(EvoUI.inputOption(APIstr.sSmallerThan, EvolLang.sNumSmaller));
							if (this.required!='1'){
								h.push(EvoUI.inputOption(APIstr.sIsNull, EvolLang.sIsNull));
								h.push(EvoUI.inputOption(APIstr.sIsNotNull, EvolLang.sIsNotNull));
							}
							break;
						default:
							h.push(EvoUI.inputOption(APIstr.sEqual, EvolLang.sEquals));
							h.push(EvoUI.inputOption(APIstr.sStart, EvolLang.sStart));
							h.push(EvoUI.inputOption(APIstr.sContain, EvolLang.sContain));
							h.push(EvoUI.inputOption(APIstr.sFinish, EvolLang.sFinish)); 
							if (this.required!='1'){
								h.push(EvoUI.inputOption(APIstr.sIsNull, EvolLang.sIsNull));
								h.push(EvoUI.inputOption(APIstr.sIsNotNull, EvolLang.sIsNotNull));
							}
							break;
					}
					h.push("</select>");
					break;
			} 
			this.element.find('.editFilter').append(h.join(''));
		}
		if(cond){
		    this.element.find('#operator').val(cond); 
		}
		this._step=2;
    },
		
	_setFilterValue: function( fType, v) {
		var editor=this.element.find('.editFilter'),
			opVal=this.element.find('#operator').val();
		if(opVal==APIstr.sIsNull || opVal==APIstr.sIsNotNull){
			editor.append(EvoUI.inputHidden('value',''));
		}else{		
			if(this._step<3){
				var h=[];
				switch (fType) {
					case fieldTypes.lov:
						h.push(EvoUI.inputLOV('value',this._field.list));
						break;
					case fieldTypes.bool:
						h.push('<span id="value">');
						h.push(EvoUI.inputRadio('value', '1', EvolLang.yes, false, 'value1'));
						h.push(EvoUI.inputRadio('value', '0', EvolLang.no, false, 'value0'));
						h.push('</span>');
						break;
					case fieldTypes.integer:
					case fieldTypes.dec:
						h.push('<input class="" type="text" id="value"/>');
						// h.push("\" OnKeyUp=\"EvoVal.checkNum(this,'", fType.Substring(0, 1), "')\">");
						break;
					default:
						h.push('<input id="value" class="" type="text">');
						break;
				}
				editor.append(h.join('')); 
				if(fType==fieldTypes.date){
					editor.find('#value').datepicker();
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
    }, 

	val: function() {
		var v=[];
		this.element.find('div:first a').each(function(){
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
    },
	
	textVal: function() {
		var v=[];
		this.element.find('div:first a').each(function(){ 
			v.push(this.innerText);
		})
        return v.join(EvolLang.opAnd);
    },
	
    destroy: function() {
		var e=this.element;
		e.find('.bPlus').off('click');
		e.find('.bAdd').off('click');
		e.find('.bDel').off('click');
		//e.find('#field').die('change');
		//e.find('#operator').die('change');
		e.empty().removeClass('structuredSearch ui-widget-content ui-corner-all');
        $.Widget.prototype.destroy.call(this);
    }

});


var EvoUI={

	inputText:function(fID,fV){
		return ['<input type="text" name="',fID,'" id="',fID,'" value="',fV,'" class="Field">'].join('');
	},
	inputTextInt:function(fID,fV,fT,max,min){
		return ['<input type="text" name="',fID,'" id="',fID,'" value="',fV,
			'" onKeyUp="EvoVal.checkNum(this,\'',fT,'\')" class="Field" maxlength="12">'].join('');
	},
	inputCheckbox:function(fID,fV){
		var fh=['<input type="checkbox" id="',fID,'"'];
		if(fV!=null&&fV!=''&&fV!='0')
			fh.push(' checked');
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
	inputLOV:function( fID, fLOV){
		var fh=['<span id="',fID,'">']; 
		for(var i in fLOV){
			var lv=fLOV[i];
			fh.push('<input type="checkbox" id="',lv.id,'" value="',lv.id,'">');
			fh.push('<label for="',lv.id,'">',lv.label,'</label> ');
		} 	
		fh.push('</span>');		
		return fh.join('');
	}
	
}

})(jQuery);

