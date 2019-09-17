export default class Api {
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