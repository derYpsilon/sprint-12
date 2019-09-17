export default class CardList {
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