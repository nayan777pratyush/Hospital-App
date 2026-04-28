import { LightningElement, track } from 'lwc';
import createAppointment from '@salesforce/apex/AppointmentService.createAppointment';

export default class AppointmentDashboard extends LightningElement {

    @track isModalOpen = false;

    patientId = '';
    doctorId = '';
    date = '';
    status = 'Pending';

    statusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Confirmed', value: 'Confirmed' }
    ];

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handlePatient(event) {
        this.patientId = event.target.value;
    }

    handleDoctor(event) {
        this.doctorId = event.target.value;
    }

    handleDate(event) {
        this.date = event.target.value;
    }

    handleStatus(event) {
        this.status = event.target.value;
    }

    saveAppointment() {
        createAppointment({
            patientId: this.patientId,
            doctorId: this.doctorId,
            appointmentDate: this.date,
            status: this.status
        })
        .then(() => {
            this.closeModal();
            location.reload(); // quick refresh
        })
        .catch(error => {
            console.error(error);
        });
    }
}