export default class Popup {
    constructor({ popupWindow, popupOpenClass, popupCloseElement }) {
        this.container = document.querySelector(popupWindow);
        this.openClass = popupOpenClass;
        this.closeElement = popupCloseElement;
    }
    open(content) {
        this.container.insertAdjacentHTML('afterbegin', content);
        this.container
            .querySelector(this.closeElement)
            .addEventListener('click', this.close.bind(this));
        this.container.classList.add(this.openClass.slice(1));
    }
    close() {
        this.container.classList.remove(this.openClass.slice(1));

        while (this.container.firstChild) {
            this.container.firstChild.remove();
        }
    }
}