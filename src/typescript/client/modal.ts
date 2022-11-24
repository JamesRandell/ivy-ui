
/**
 * function handles the closing of the modal.
 * When a user clicks the 'close' button, or the background, we change the URL to what ever it was before the 
 * modal was opened, and adjust the class list 
 */
function modalF() {


    document.body.addEventListener("click", function(event: Event & {
        target: HTMLButtonElement
    }) {

        const { target } = event;

        if (target.id === 'close' || target.id === 'modal') {
            window.document.getElementById('modal').classList.remove('open');

            console.log(window.history.state.prevURL);
            window.history.pushState({pageID: window.history.state.prevURL}, window.history.state.prevURL, window.history.state.prevURL);
        }

    })
}

export const modal = modalF();
