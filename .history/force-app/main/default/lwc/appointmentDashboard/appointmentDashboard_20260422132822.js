import { LightningElement, wire, track } from 'lwc';
import getAppointments from '@salesforce/apex/AppointmentService.getAppointments';

export default class AppointmentDashboard extends LightningElement {

    @track appointments = [];
    @track filteredAppointments = [];

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Date', fieldName: 'Date__c', type: 'date' },
        { label: 'Doctor', fieldName: 'DoctorName' },
        { label: 'Patient', fieldName: 'PatientName' }
    ];

    @wire(getAppointments)
    wiredData({ error, data }) {
        if (data) {
            this.appointments = data.map(item => ({
                ...item,
                DoctorName: item.Doctor__r ? item.Doctor__r.Name : '',
                PatientName: item.Patient__r ? item.Patient__r.Name : ''
            }));

            this.filteredAppointments = this.appointments;
        } else if (error) {
            console.error(error);
        }
    }

    handleSearch(event) {
        const searchKey = event.target.value.toLowerCase();

        this.filteredAppointments = this.appointments.filter(item =>
            item.Name.toLowerCase().includes(searchKey)
        );
    }
}