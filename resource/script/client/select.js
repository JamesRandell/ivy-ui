class Select {
    constructor(selectObj) {
        this.configClass = {
            main: 'ui fluid selection dropdown upward',
            title: 'text',
            list: 'menu transition hidden',
            option: 'item',
            icon: 'dropdown icon',
            optGroup: 'optgroup',
            selected: 'selected',
            disabled: 'disabled',
            open: 'open'
        };
        this.index = 0;
        this.e = {
            main: Object,
            button: Object,
            icon: Object,
            list: Object,
            optGroup: Object
        };
        this.e.main = document.createElement('div');
        this.e.main.className = this.configClass.main;
        this.e.button = document.createElement('div');
        this.e.button.className = this.configClass.title;
        this.e.button.textContent = selectObj[0].textContent;
        this.e.icon = document.createElement('i');
        this.e.icon.className = this.configClass.icon;
        this.e.list = document.createElement('div');
        this.e.list.className = this.configClass.list;
        this.e.optGroup = selectObj.getElementsByTagName('optgroup');
        const selectName = selectObj.name;
        // dealing with optgroups
        if (this.e.optGroup.length) {
            for (var i = 0; i < this.e.optGroup.length; i++) {
                var div = document.createElement('div');
                div.innerText = this.e.optGroup[i].label;
                div.classList.add(this.configClass.optGroup);
                this.e.list.appendChild(div);
                this._generateOptions(this.e.optGroup[i].getElementsByTagName('option'));
            }
        }
        else {
            this._generateOptions(selectObj.getElementsByTagName('option'));
        }
        // appending the button and the list
        this.e.main.appendChild(this.e.icon);
        this.e.main.appendChild(this.e.button);
        this.e.main.appendChild(this.e.list);
        // pseudo-select is ready - append it and hide the original
        selectObj.parentNode.insertBefore(this.e.main, selectObj);
        selectObj.style.display = 'none';
        selectObj.parentNode.addEventListener('click', console.log(4));
    }
    _generateSelectReplacement(selectObj) {
    }
    _generateOptions(options) {
        for (let i = 0; i < options.length; i++) {
            let item = document.createElement('div');
            item.setAttribute('data-value', options[i].value);
            item.setAttribute('data-index', (this.index++).toString());
            item.setAttribute('class', this.configClass.option);
            item.innerText = options[i].textContent;
            if (options[i].selected) {
                item.classList.add(this.configClass.selected);
                this.e.button.textContent = options[i].textContent;
            }
            if (options[i].disabled) {
                item.classList.add(this.configClass.disabled);
            }
            this.e.list.appendChild(item);
        }
    }
    _onClick(e) {
        console.log(1);
        e.preventDefault();
        return;
        let t = e.target; // || e.srcElement; - uncomment for IE8
        if (t.className === this.e.configClass.title) {
            this._toggle();
        }
        if (t.tagName === 'DIV' && !t.classList.contains(this.e.configClass.disabled)) {
            this.e.main.querySelector('.' + this.e.configClass.title).innerHTML = t.innerHTML;
            elem.options.selectedIndex = t.getAttribute('data-index');
            //trigger 'change' event
            var evt = bubbles ? new CustomEvent('change', { bubbles: true }) : new CustomEvent('change');
            elem.dispatchEvent(evt);
            // highlight the selected
            for (var i = 0; i < optionsLength; i++) {
                //ul.querySelectorAll('li')[i].classList.remove(selectedClass);
            }
            t.classList.add(this.configClass.selected);
            this._close();
        }
    }
    _toggle() {
        this.e.list.classList.toggle(this.configClass.open);
    }
    _open() {
        this.e.list.classList.add(this.configClass.open);
    }
    _close() {
        this.e.list.classList.remove(this.configClass.open);
    }
}
export { Select };
