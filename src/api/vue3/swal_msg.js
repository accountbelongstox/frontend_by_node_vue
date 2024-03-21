import { inject } from 'vue';

class Message {
    Swal = null
    setSetupSwal(Swal) {
        // { inject } from 'vue'
        // swalMsg.setSetupSwal(inject('$swal'));
        if (!this.Swal) {
            this.Swal = Swal;
        }
        if (!this.Swal) {
            console.warn('Swal is not available. Make sure you have injected it properly.');
        }
    }

    Toast(position) {
        return this.Swal.mixin({
            toast: true,
            position: position,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = this.Swal.stopTimer;
                toast.onmouseleave = this.Swal.resumeTimer;
            }
        });
    }

    showMessage(title, text, icon = 'success', timer = 1500) {
        this.setSetupSwal();

        this.Swal.fire({
            icon: icon,
            title: title,
            text: text,
            showConfirmButton: false,
            timer: timer
        });
    }

    showToast(text, icon = 'success', timer = 1500, position = "top-end") {
        this.setSetupSwal();

        this.Toast(position).fire({
            icon: icon,
            text: text,
            timer: timer,
        });
    }

    showToastTopRight(text, icon = 'success', timer = 1500) {
        this.showToast(text, icon, timer, "top-end");
    }

    showToastMiddleRight(text, icon = 'success', timer = 1500) {
        this.showToast(text, icon, timer, "center-end");
    }

    showToastBottomRight(text, icon = 'success', timer = 1500) {
        this.showToast(text, icon, timer, "bottom-end");
    }
}

export default new Message();
