


class Select {

configClass = {
    main: 'ui fluid selection dropdown',
    title: 'default text',
    list: 'menu transition',
    option: 'item',
    icon: 'dropdown icon',
    optGroup: 'optgroup',
    selected: 'selected',
    disabled: 'disabled',
    open: 'visible'
}
binding = {};
index = 0;
private e: any = {
    main: Object,
    button: Object,
    icon: Object,
    list: Object,
    optGroup: Object,
    optionCount: Number,
    select: Object,
    input: Object,
    value: String
}
constructor(selectObj: object = null, selectName: string = null) {
    
    if (!selectName) {
        selectName = (selectObj as any).name;
    }

    if (!selectObj) {
        selectObj = document.querySelector('select[name=' + selectName + ']');
    }

    if (!selectObj) {
        return;
    }

    if ((selectObj as any).offsetParent === null) {
        return;
    }

    /**
     * check if this is still a select object
     * 
     * I encoutered a race condition form the calling side where this function was ran twice for the same page.
     */

    this.e.select = selectObj;


    
    
    this.e.main = document.createElement('div');
    this.e.main.className = this.configClass.main;

    this.e.button = document.createElement('div');
    this.e.button.className = this.configClass.title;
    this.e.button.textContent = selectObj[0].textContent;

    this.e.icon = document.createElement('i');
    this.e.icon.className = this.configClass.icon;

    this.e.list = document.createElement('div');
    this.e.list.className = this.configClass.list;

    this.e.optGroup = (selectObj as any).getElementsByTagName('optgroup');
    


    // dealing with optgroups
    if (this.e.optGroup.length) {
        for (var i = 0; i < this.e.optGroup.length; i++) {
            var div = document.createElement('div');
            div.innerText = this.e.optGroup[i].label;
            div.classList.add(this.configClass.optGroup);

            this.e.list.appendChild(div);
            this._generateOptions(this.e.optGroup[i].getElementsByTagName('option'));
        }
    } else {
        this._generateOptions((selectObj as any).getElementsByTagName('option'));
    }


    this.e.input = document.createElement('input');
    this.e.input.type = 'hidden';
    this.e.input.name = selectName;
    this.e.input.value = this.e.value;
    if ((selectObj as any).id) {
        this.e.input.id = (selectObj as any).id;
    }


    // appending the button and the list
    this.e.main.appendChild(this.e.input);
    this.e.main.appendChild(this.e.icon);
    this.e.main.appendChild(this.e.button);
    this.e.main.appendChild(this.e.list);


    // pseudo-select is ready - append it and hide the original
    (selectObj as any).parentNode.insertBefore(this.e.main, selectObj);
    (selectObj as any).style.display = 'none';
    var that = this;


    /**
     * see if we have created a listener on the body for select events yet
     */
    const checkListener = document.body;
    if (checkListener.getAttribute('data-select') !== 'true') {
        checkListener.setAttribute('data-select', 'true');
        document.addEventListener('click', function(e) {
            that._onClickOff(e);
        })
    }
    this.binding = this._onClick.bind(this)
    this.e.main.addEventListener('click', this.binding, false);
/*
    this.e.main.addEventListener('click', function(e){
        that._onClick(e);
    });
 */
   document.querySelector('select[name=' + selectName + ']').remove();

}


private _generateSelectReplacement (selectObj) {

}


private _generateOptions(options) {

    this.e.value = options[0].value;
    this.e.button.textContent = options[0].textContent;
    this.e.optionCount = options.length;

    for (let i=0; i<options.length; i++) {
      let item: HTMLElement = document.createElement('div');
  
      
      item.setAttribute('data-value', options[i].value);
      item.setAttribute('data-index', (this.index++).toString());
      item.setAttribute('class', this.configClass.option);
      item.innerText = options[i].textContent;

      if (options[i].selected) {
        item.classList.add(this.configClass.selected);
        this.e.button.textContent = options[i].textContent;
        this.e.value = options[i].textContent;
      }
      if (options[i].disabled) {
        item.classList.add(this.configClass.disabled);
      }
  
      this.e.list.appendChild(item);
    }

    if (this.e.optionCount > 5) {
        this.e.list.classList.add('scroll');
    }
}

private _onClickOff(e) {

    let t = e.target;
    

    
    if (!t.classList.contains('selection') && t.className != this.configClass.icon) {

        /**
          if (t.classList.contains(this.configClass.option)) {
            this.e.input.value = t.getAttribute('data-value');
            this.e.button.textContent = t.innerText;
            let options = t.parentNode.getElementsByClassName('item');
            [].forEach.call(options, function(el) {
                el.classList.remove('selected')
            });
            t.classList.add(this.configClass.selected);
        }
        */
        

        this._close();
        return
    }

}
private _onClick(e) {
    

    //e.preventDefault();
    
    let t = e.target; // || e.srcElement; - uncomment for IE8
    if (t.className == this.configClass.icon) {
        t = t.closest('div.selection');
    }

    if (!t.classList.contains('selection') && t.className != this.configClass.icon) {

        if (t.classList.contains(this.configClass.option)) {

            this.e.input.value = t.getAttribute('data-value');
            this.e.button.textContent = t.innerText;
            let options = t.parentNode.getElementsByClassName('item');
            const selectClass = this.configClass.selected;
            [].forEach.call(options, function(el) {
                el.classList.remove(selectClass)
            });
            t.classList.add(selectClass);
        }
        
        
        this._close();
        return
    }




    if (this.e.main.classList.contains('selection') || this.e.main.className == this.configClass.icon) {
        
        if (this.e.main.classList.contains(this.configClass.open)) {
            this._close();
        } else {
            this._open();
        }
    } else {
        this._close();
    }
    if (this.e.main.className === this.configClass.title) {
        this._toggle();
    }


    //this._open();
    if (t.tagName === 'DIV' && !t.classList.contains(this.configClass.disabled)) {
        //this.e.main.querySelector('.' + this.configClass.title).innerHTML = e.innerHTML;
        this.e.select.options.selectedIndex = t.getAttribute('data-index');

        //trigger 'change' event
        //var evt = new CustomEvent('change');
        //this.e.select.dispatchEvent(evt);

        // highlight the selected
        for (var i = 0; i < this.e.select.options.length; i++) {
        //ul.querySelectorAll('li')[i].classList.remove(selectedClass);
        }
        t.classList.add(this.configClass.selected);

        //this._close();
    }
}

private _toggle () {
    this.e.main.classList.toggle(this.configClass.open);
    this.e.list.classList.toggle(this.configClass.open);
}

private _open () {
    this._close();
    this.e.main.classList.add(this.configClass.open);
    this.e.list.classList.add(this.configClass.open);

    this.e.main.classList.remove('hidden');
    
    this.e.list.style.maxHeight = this.e.main.offsetHeight * this.e.optionCount + 3 + "px";
}

private _close () {
    this.e.main.classList.remove(this.configClass.open);
    this.e.main.classList.remove(this.configClass.selected);
    this.e.list.classList.remove(this.configClass.open);
    
    this.e.list.style.maxHeight = 0;

    let open = this.configClass.open;
    let selected = this.configClass.selected;
    [].forEach.call(document.querySelectorAll('.selection.visible .menu.visible'), function(el) {
        el.classList.remove(open);
        el.style.maxHeight = 0
    });
    
    [].forEach.call(document.querySelectorAll('.selection.visible'), function(el) {
        el.classList.remove(open);
        el.classList.remove(selected);
    });
    
    

}


}
export { Select }; 
  