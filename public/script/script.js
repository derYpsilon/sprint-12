'use strict';
/* Классы */

class Card {
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

class CardList {
    constructor(config) {
        this.config = config;
        this.container = document.querySelector(config.renderContainer);
        this.initRender();
        this.container.addEventListener('click', this.clickHandler.bind(this))
    }
    addCard(name, link, likes, id, userID, owner) {
        const theCard = new Card(name, link, likes.length, id, this.config);
        this.container.appendChild(theCard.cardElement);
        if (Api.isLiked(likes, userID).length > 0) {
            Card.renderLike(theCard.cardElement.querySelector(this.config.cardLikeIcon), this.config.likeClassToToggle);
        }
        if (userID === owner) {
            theCard.cardElement.querySelector(this.config.cardDeleteIcon).classList.add(this.config.cardDeleteIconVisible.slice(1));
        }
    }
    initRender() {
        const serverAPI = new Api(this.config);
        serverAPI.loadUserInfo()
            .then((result) => {
                document.querySelector('.user-info__photo').style.backgroundImage = `url(${result.avatar})`;
                document.querySelector('.user-info__name').textContent = result.name;
                document.querySelector('.user-info__job').textContent = result.about;
            })
            .catch(() => { console.log('Unable to load user info') });
        serverAPI.getInitialCards()
            .then((res) => {
                if (res) {
                    for (let i = 0; i < res.data.length; i++) {
                        this.addCard(res.data[i].name, res.data[i].link, res.data[i].likes, res.data[i].id, res.userID, res.data[i].owner);
                    }
                } else {
                    throw error;
                }
            })
            .catch(() => {
                let errorMessageBanner = new ErrorReport(this.config.errorContainer, this.config.errorBannerClass);
                errorMessageBanner.showMessage('initRender завершился полным провалом');
            });
    }
    clickHandler(event) {
        if (event.target.classList.contains(this.config.cardDeleteIcon.slice(1))) { Card.remove(event.target, this.config.cardContainer, this.config); }
        if (event.target.classList.contains(this.config.cardLikeIcon.slice(1))) { Card.like(event.target, this.config.likeClassToToggle, this.config); }
        if (event.target.classList.contains(this.config.cardImageElement.slice(1))) {
            Card.zoom(this.config.popupImageClass, event.target.getAttribute(this.config.cardImageURLAttribute), this.config);
        }
    }
}
class Popup {
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

class ErrorReport {
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

class Api {
    constructor({ server, cohort, token, contentType, errorContainer, errorBannerClass }) {

        this.baseURL = `${server}/${cohort}`;
        this.headers = {
            authorization: token,
            'Content-Type': contentType
        }
        this.errorContainer = errorContainer;
        this.errorBannerClass = errorBannerClass;
        this.userID = '';
        this.getUserID()
            .then((result) => {
                if (result) {
                    this.userID = result;
                }
                else {
                    throw error;
                }
            })
            .catch(() => {
                let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                errorMessageBanner.showMessage('Нет соединения с сервером, не могу загрузить ID пользователя');
            });
    }

    getInitialCards() {
        return fetch(`${this.baseURL}/cards`, {
            headers: this.headers
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                        .then((result) => {
                            if (result) {
                                let cards = [];
                                for (let i = 0; i < result.length; i++) {
                                    cards.push({ 'name': result[i].name, 'link': result[i].link, 'likes': result[i].likes, 'id': result[i]._id, 'owner': result[i].owner._id });
                                }
                                return { 'userID': this.userID, 'data': cards };
                            } else {
                                let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                                errorMessageBanner.showMessage('Произошла ошибка');
                            }
                        });
                }
                else {
                    throw error;
                }
            })
            .catch((res) => {
                let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                errorMessageBanner.showMessage('Нет соединения с сервером, не могу загрузить карточки');
            });
    }
    saveCard(name, link) {
        return fetch(`${this.baseURL}/cards`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                name: name,
                link: link
            })
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                        .then((result) => {
                            if (result) {
                                return { 'id': result._id, 'likes': result.likes, 'owner': result.owner._id };
                            }
                            else {
                                throw error;
                            }
                        })
                        .catch(() => { throw error; });
                }
                else {
                    throw error;
                }
            })
            .catch(() => {
                let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                errorMessageBanner.showMessage('Нет соединения с сервером, не могу сохранить карточку на сервере');
                return false;
            });
    }
    deleteCard(id) {
        return fetch(`${this.baseURL}/cards/${id}`, {
            method: 'DELETE',
            headers: this.headers,
        })
            .then((res) => {
                if (res.ok) {
                    return true;
                }
                else {
                    throw error;
                }
            })
            .catch(() => {
                let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                errorMessageBanner.showMessage('Нет соединения с сервером, не могу удалить карточку с сервера');
                return false;
            });
    }
    getUserID() {
        return fetch(`${this.baseURL}/users/me`, {
            headers: this.headers
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                        .then((result) => {
                            if (result) {
                                return (result._id);
                            } else {
                                throw error;
                            }
                        })
                        .catch((error) => {
                            let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                            errorMessageBanner.showMessage('Соединение установлено, но данные пользователя не получены');
                            throw error;
                        });
                }
                else {
                    throw error;
                }
            })
            .catch(res => {
                let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                errorMessageBanner.showMessage('Нет соединения с сервером, не могу загрузить данные профиля');
            });
    }
    setLike(id) {
        return fetch(`${this.baseURL}/cards/like/${id}`, {
            method: 'PUT',
            headers: this.headers
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                        .then((result) => {
                            if (result) {
                                return result.likes.length;
                            }
                            else {
                                throw error;
                            }
                        })
                        .catch(() => {
                            throw error;
                        });
                }
                else {
                    throw error;
                }
            })
            .catch(() => {
                let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                errorMessageBanner.showMessage('Нет соединения с сервером, не могу поставить лайк');
            });
    }
    removeLike(id) {
        return fetch(`${this.baseURL}/cards/like/${id}`, {
            method: 'DELETE',
            headers: this.headers
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                        .then((result) => {
                            if (result) {
                                return result.likes.length;
                            }
                            else {
                                throw error;
                            }
                        })
                        .catch(() => {
                            throw error;
                        });
                }
                else {
                    throw error;
                }
            })
            .catch(() => {
                let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                errorMessageBanner.showMessage('Нет соединения с сервером, не могу убрать лайк');
            });
    }
    static isLiked(likes, user) {
        return likes.filter(function (item) {
            return item._id === user;
        });
    }
    loadUserInfo() {
        return fetch(`${this.baseURL}/users/me`, {
            headers: this.headers
        })
            .then((res) => {
                if (res.ok) {
                    return res.json()
                        .then((result) => {
                            if (result) {
                                return result;
                            } else {
                                throw error;
                            }
                        })
                        .catch((error) => {
                            let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                            errorMessageBanner.showMessage('Соединение установлено, но данные пользователя не получены');
                        });
                }
                else {
                    throw error;
                }
            })
            .catch(res => {
                let errorMessageBanner = new ErrorReport(this.errorContainer, this.errorBannerClass);
                errorMessageBanner.showMessage('Нет соединения с сервером, не могу загрузить данные профиля');
            });
    }
    editUserInfo(name, about) {
        return fetch(`${this.baseURL}/users/me`, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify({
                name: name,
                about: about
            })
        });
    }
}

/* Инициализируем переменные */

const config = {
    renderContainer: `.places-list`,

    popupWindow: `.popup`,
    popupOpenClass: `.popup_is-opened`,
    popupCloseElement: `.popup__close`,
    popupImageClass: `.popup__big-image`,


    buttonToEditUserInfo: `.user-info__edit-button`,
    buttonToAddNewCard: `.user-info__button`,
    pictureToChangeUserPic: `.user-info__photo`,

    cardContainer: `.place-card`,
    cardImageElement: `.place-card__image`,
    cardDeleteIcon: `.place-card__delete-icon`,
    cardDeleteIconVisible: `.place-card__delete-icon_visible`,
    cardLikeIcon: `.place-card__like-icon`,
    cardDescription: `.place-card__description`,
    cardTitle: `.place-card__name`,
    likeClassToToggle: `.place-card__like-icon_liked`,
    likeWrapperClass: `.place-card__like_wrapper`,
    likeCounterClass: `.place-card__like_counter`,
    cardImageURLAttribute: `imageURL`,

    submitUserInfoButton: `#submituser`,
    submitAddCardButton: `#add_card_button`,

    errorBannerClass: `.error__message`,
    errorContainer: `.error__container`,

    cohort: `cohort1`,
    token: `6ee4cdf1-bd16-471c-8383-68a056025de9`,
    server: `http://95.216.175.5`,
    contentType: `application/json`

};

const popUpInnerHTML = {
    addCard:
        `<div class="popup__content">
        <img src="./images/close.svg" alt="" class="popup__close">
        <h3 class="popup__title">Новое место</h3>
        <form class="popup__form" name="new">
          <label for="name">
            <input type="text" name="name" class="popup__input popup__input_type_name" placeholder="Название"
              minlength="2" maxlength="30" required>
            <span class="popup__error" aria-live="polite" id="error-name"></span>
        </label>
        <label for="link">
            <input type="URL" name="link" class="popup__input popup__input_type_link-url"
            placeholder="Ссылка на картинку" required>
            <span class="popup__error" aria-live="polite" id="error-link"></span>
        </label>
        <button type class="button popup__button" id="add_card_button">+</button>
        </form>
    </div>`,
    editProfile:
        `<div class="popup__content">
        <img src="./images/close.svg" alt="" class="popup__close">
        <h3 class="popup__title">Редактировать профиль</h3>
        <form class="popup__form" name="user">
            <label for="username">
                <input type="text" name="username" class="popup__input popup__input_type_name" placeholder="Имя"
                minlength="2" maxlength="30" required>
                <span class="popup__error" aria-live="polite" id="error-username"></span>
            </label>
            <label for="about">
                <input type="text" name="about" class="popup__input popup__input_type_link-url" placeholder="О себе"
                minlength="2" maxlength="30" required>
                <span class="popup__error" aria-live="polite" id="error-about"></span>
            </label>
            <button type class="button popup__button" id="submituser">Сохранить</button>
        </form>
    </div>`,
    editUserPic:
        `<div class="popup__content">
        <img src="./images/close.svg" alt="" class="popup__close">
        <h3 class="popup__title">Новый аватар</h3>
        <form class="popup__form" name="userpic">
        <label for="link">
            <input type="URL" name="link" class="popup__input popup__input_type_link-url"
            placeholder="Ссылка на аватар" required>
            <span class="popup__error" aria-live="polite" id="error-link"></span>
        </label>
        <button type class="button popup__button" id="add_card_button">Сохранить</button>
        </form>
    </div>`
};

const thePlaces = new CardList(config);
const popUp = new Popup(config);

const openDialogButton = document.querySelector(config.buttonToAddNewCard);
const openEditUserButton = document.querySelector(config.buttonToEditUserInfo);
const userPic = document.querySelector(config.pictureToChangeUserPic);


/* Функции */

// Обработчик кнопки открытия диалогового окна

function openTheForm(event) {
    if (event.target.classList.contains('user-info__button')) {
        popUp.open(popUpInnerHTML.addCard);
        const theForm = document.forms.new;
        const submitFormButton = popUp.container.querySelector('.popup__button');
        theForm.addEventListener('input', formInputHandler);
        theForm.addEventListener('submit', formAddElement);
        disablePopUpButton(submitFormButton);
    }
    if (event.target.classList.contains('user-info__edit-button')) {
        popUp.open(popUpInnerHTML.editProfile);
        const theEditForm = document.forms.user;
        const submitEditUser = popUp.container.querySelector('.popup__button');
        submitEditUser.style.fontSize = '18px';
        theEditForm.addEventListener('input', editFormHandler);
        theEditForm.addEventListener('submit', editFormSubmit);
        theEditForm.elements.username.value = document.querySelector('.user-info__name').textContent;
        theEditForm.elements.about.value = document.querySelector('.user-info__job').textContent;
    }
    if (event.target.classList.contains('user-info__photo')) {
        popUp.open(popUpInnerHTML.editUserPic);
        const theAvatarForm = document.forms.userpic;
        const submitAvatarButton = popUp.container.querySelector('.popup__button');
        submitAvatarButton.style.fontSize = '18px';
        //theAvatarForm.addEventListener('input', formInputHandler);
        //theAvatarForm.addEventListener('submit', formAddElement);
        disablePopUpButton(submitAvatarButton);
    }
}

// Функции для отключения и включения кнопки submit в любой форме 

function disablePopUpButton(button) {
    button.setAttribute('disabled', true);
    button.classList.add('popup__button_disabled');
}

function enablePopUpButton(button) {
    button.removeAttribute('disabled');
    button.classList.remove('popup__button_disabled');
}

function isValid(elementToCheck) {
    const errorElement = document.querySelector(`#error-${elementToCheck.name}`)

    if (!elementToCheck.validity.valid) {

        if (elementToCheck.validity.typeMismatch) { errorElement.textContent = 'Здесь должна быть ссылка'; }
        if (elementToCheck.value.length < Number(elementToCheck.getAttribute('minlength'))) {
            if (elementToCheck.validity.valueMissing) { errorElement.textContent = 'Это обязательное поле'; }
            else { errorElement.textContent = 'Длина должна быть от 2 до 30 символов'; }
        }
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

function resetErrorMessages(parentNode) {
    const errorsCollection = Array.from(parentNode.getElementsByTagName('span'));
    errorsCollection.forEach(function (item) {
        if (item.id.includes('error')) { item.textContent = ''; }
    });
}

// Обработчики ввода данных в форме

function formInputHandler(event) {
    const theForm = document.forms.new;
    const submitFormButton = popUp.container.querySelector('.popup__button');
    let validatePlace = isValid(theForm.elements.name);
    let validateURL = isValid(theForm.elements.link);
    if (validatePlace && validateURL) {
        enablePopUpButton(submitFormButton);
    } else {
        disablePopUpButton(submitFormButton);
    }
}

function editFormHandler() {
    const theEditForm = document.forms.user;
    const submitEditUser = popUp.container.querySelector('.popup__button');
    let validateUserName = isValid(theEditForm.elements.username);
    let validateAbout = isValid(theEditForm.elements.about);

    if (validateUserName && validateAbout) { enablePopUpButton(submitEditUser); }
    else { disablePopUpButton(submitEditUser); }
}

// Отправка измененной user info

function editFormSubmit(event) {
    event.preventDefault();
    const theEditForm = document.forms.user;
    const uName = theEditForm.elements.username.value;
    const uAbaut = theEditForm.elements.about.value;
    const serverAPI = new Api(config);
    const submit = document.querySelector(config.submitUserInfoButton);
    submit.textContent = 'Загрузка...';
    serverAPI.editUserInfo(uName, uAbaut)
        .then((res) => {
            if (res.ok) {
                document.querySelector('.user-info__name').textContent = uName;
                document.querySelector('.user-info__job').textContent = uAbaut;
                popUp.close();
            }
        })
        .catch((res) => {
            let errorMessageBanner = new ErrorReport(config.errorContainer, config.errorBannerClass);
            errorMessageBanner.showMessage('Нет соединения с сервером, попробуйте отправить данные еще раз');
            submit.textContent = 'Сохранить';
        });
}

// Функция добавления новой карточки

function formAddElement(event) {

    event.preventDefault();

    const theForm = document.forms.new;

    const name = theForm.elements.name;
    const link = theForm.elements.link;

    const submit = document.querySelector(config.submitAddCardButton);
    submit.textContent = 'Загрузка...';

    const serverAPI = new Api(config);
    serverAPI.saveCard(name.value, link.value)
        .then((res) => {
            if (res) {
                // Создаем карточку
                console.log(res);
                thePlaces.addCard(name.value, link.value, res.likes, res.id, serverAPI.userID, res.owner);
                // Очищаем поля формы
                theForm.reset();
                // Закрываем окно диалога
                popUp.close();
            }
            else {
                throw error;
            }
        })
        .catch(() => {
            submit.textContent = '+';
            return;
        });
}

openDialogButton.addEventListener('click', openTheForm);
openEditUserButton.addEventListener('click', openTheForm);
userPic.addEventListener('click', openTheForm);