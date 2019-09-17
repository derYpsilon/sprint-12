export default class Card {
    constructor(name, link, likes, id, config) {
        this.config = config;
        this.cardElement = this.create(name, link, likes, id);
    }
    static get zoomHTML() {
        return `<div class="popup__big-image-wrap">
        <img src="./images/close.svg" alt="" class="popup__close">
        <img class="popup__big-image" src=''>
        </div>`;
    }
    static like(element, classToToggle, config) {
        const serverAPI = new Api(config);
        if (element.classList.contains(classToToggle.slice(1))) {
            serverAPI.removeLike(element.closest(config.cardContainer).getAttribute('serverImageID'))
                .then((result) => {
                    element.closest(config.cardContainer).querySelector(config.likeCounterClass).textContent = result;
                    element.classList.toggle(classToToggle.slice(1));
                })
                .catch(() => {
                    let errorMessageBanner = new ErrorReport(config.errorContainer, config.errorBannerClass);
                    errorMessageBanner.showMessage('Нет связи с сервером, учет лайков не работает');
                });
        }
        else {
            serverAPI.setLike(element.closest(config.cardContainer).getAttribute('serverImageID'))
                .then((result) => {
                    element.closest(config.cardContainer).querySelector(config.likeCounterClass).textContent = result;
                    element.classList.toggle(classToToggle.slice(1));
                })
                .catch(() => {
                    let errorMessageBanner = new ErrorReport(config.errorContainer, config.errorBannerClass);
                    errorMessageBanner.showMessage('Нет связи с сервером, учет лайков не работает');
                });
        }
    }
    static renderLike(element, classToToggle) {
        element.classList.toggle(classToToggle.slice(1));
    }
    static remove(element, parentNode, config) {
        if (window.confirm("Прям удалить карточку?")) {
            const elementToDelete = element.closest(parentNode);
            const serverAPI = new Api(config);
            serverAPI.deleteCard(elementToDelete.getAttribute('serverImageID'))
                .then((res) => {
                    if (res) {
                        elementToDelete.parentNode.removeChild(elementToDelete);
                    }
                    else {
                        throw error;
                    }
                })
                .catch(() => {
                    let errorMessageBanner = new ErrorReport(config.errorContainer, config.errorBannerClass);
                    errorMessageBanner.showMessage('Нет связи с сервером, ничего удалить не могу');
                });

        }
    }
    static zoom(popupImageClass, imageURL, configForPopup) {
        const localPopUp = new Popup(configForPopup);
        localPopUp.open(this.zoomHTML);
        const bigPicture = document.querySelector(popupImageClass);
        bigPicture.src = imageURL;
    }
    create(name, link, likes, id) {
        /**
         * Для отработки полезных навыков попробуйте использовать фрагменты вместо DIV
         * https://developer.mozilla.org/en-US/docs/Web/API/Document/createDocumentFragment
         */
        const theCard = document.createElement('div');
        const cardImageElement = document.createElement('div');
        const deleteIconElement = document.createElement('button');
        const cardDescription = document.createElement('div');
        const cardName = document.createElement('h3');
        const likeIcon = document.createElement('button');
        const likeWrapper = document.createElement('div');
        const likeCounter = document.createElement('div');

        theCard.classList.add(this.config.cardContainer.slice(1));

        cardImageElement.classList.add(this.config.cardImageElement.slice(1));
        cardImageElement.setAttribute(this.config.cardImageURLAttribute, link);
        cardImageElement.style.backgroundImage = `url(${link})`;

        deleteIconElement.classList.add(this.config.cardDeleteIcon.slice(1));
        cardImageElement.appendChild(deleteIconElement);

        cardDescription.classList.add(this.config.cardDescription.slice(1));

        cardName.classList.add(this.config.cardTitle.slice(1));
        cardName.textContent = name;

        cardDescription.appendChild(cardName);

        likeIcon.classList.add(this.config.cardLikeIcon.slice(1));
        likeWrapper.classList.add(this.config.likeWrapperClass.slice(1));
        likeCounter.classList.add(this.config.likeCounterClass.slice(1));
        likeCounter.textContent = likes;
        likeWrapper.appendChild(likeIcon);
        likeWrapper.appendChild(likeCounter);
        cardDescription.appendChild(likeWrapper);

        theCard.appendChild(cardImageElement);
        theCard.appendChild(cardDescription);
        theCard.setAttribute('serverImageID', id);

        return theCard;
    }
}