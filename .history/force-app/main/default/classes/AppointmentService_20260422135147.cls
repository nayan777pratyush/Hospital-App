public with sharing class AppointmentService {

    @AuraEnabled(cacheable=true)
    public static List<Appointment__c> getAppointments() {
        return [
            SELECT Id, Name, Status__c, Date__c,
                   Doctor__r.Name, Patinet__r.Name
            FROM Appointment__c
            ORDER BY Date__c DESC
            LIMIT 50
        ];
    }
    @AuraEnabled
    public static void createAppointment(Id patientId, Id doctorId, Date date, String status) {
        Appointment__c app = new Appointment__c(
            Patinet__c = patientId,
            Doctor__c = doctorId,
            Date__c = date,
            Status__c = status
        );
        insert app;
    }

    public static void assignDoctor(List<Appointment__c> appointments) {
        List<Doctor__c> docs = [
            SELECT Id FROM Doctor__c
            WHERE Availability__c = true LIMIT 1
        ];

        for (Appointment__c app : appointments) {
            if (app.Doctor__c == null && !docs.isEmpty()) {
                app.Doctor__c = docs[0].Id;
            }
        }
    }
}