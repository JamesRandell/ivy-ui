/**
 * function handles the closing of the modal.
 * When a user clicks the 'close' button, or the background, we change the URL to what ever it was before the
 * modal was opened, and adjust the class list
 */
class Modal {
    constructor() {
        const modalNode = window.document.getElementById('modal');
        if (modalNode == null) {
            const modalObj = document.createElement('modal');
            modalObj.id = 'modal';
            modalObj.classList.add('modal');
            document.getElementsByTagName('body')[0].appendChild(modalObj);
        }
        this.modalF();
    }
    modalF() {
        document.body.addEventListener("click", function (event) {
            const { target } = event;
            if (target.id === 'close' || target.id === 'modal') {
                window.document.getElementById('modal').classList.remove('open');
                console.log(window.history.state.prevURL);
                window.history.pushState({ pageID: window.history.state.prevURL }, window.history.state.prevURL, window.history.state.prevURL);
            }
        });
    }
}
export { Modal };
//export const modal = modalF();
