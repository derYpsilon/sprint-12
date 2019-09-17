import {ErrorReport} from './modules/error-report.js';
import {Api} from './modules/api.js';
import {Popup} from './modules/popup.js';
import {Card} from './modules/card.js';
import {CardList} from './modules/cardlist';
'use strict';

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