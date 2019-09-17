export default class ErrorReport {
    constructor(containerName, className) {
        if (!document.querySelector(containerName)) {
            let newContainer = document.createElement('div');
            newContainer.classList.add(containerName.slice(1));
            document.body.appendChild(newContainer);
        }
        this.container = document.querySelector(containerName);
        this.className = className.slice(1);
        this.element = document.createElement('a');
        this.element.classList.add(this.className);
        this.element.href = '#';
        this.container.appendChild(this.element);
        this.element.addEventListener('click', this.closeMessage.bind(this))
    }
    closeMessage(event) {
        // event не используется
        this.container.removeChild(this.element);
    }
    showMessage(text) {
        this.element.insertAdjacentHTML('afterbegin', text);
    }
}