public with sharing class AppointmentService {

    // ✅ FETCH
    @AuraEnabled(cacheable=true)
    public static List<Appointment__c> getAppointments() {
        return [
            SELECT Id, Name, Status__c, Appointment_Date_Time__c,
                   Doctor__c, Patinet__c,
                   Doctor__r.Name, Patinet__r.Name
            FROM Appointment__c
            ORDER BY Appointment_Date_Time__c DESC
            LIMIT 50
        ];
    }

    // ✅ CREATE
    @AuraEnabled
    public static void createAppointment(
        Id patientId,
        Id doctorId,
        Datetime dateValue,
        String status
    ) {
        Appointment__c app = new Appointment__c(
            Patinet__c = patientId,
            Doctor__c = doctorId,
            Appointment_Date_Time__c = dateValue,
            Status__c = status
        );
        insert app;
    }

    // ✅ UPDATE
    @AuraEnabled
    public static void updateAppointment(
        Id recordId,
        Id patientId,
        Id doctorId,
        Datetime dateValue,
        String status
    ) {
        Appointment__c appt = [
            SELECT Id
            FROM Appointment__c
            WHERE Id = :recordId
            LIMIT 1
        ];

        appt.Patinet__c = patientId;
        appt.Doctor__c = doctorId;
        appt.Appointment_Date_Time__c = dateValue;
        appt.Status__c = status;

        update appt;
    }

public static void assignDoctor(List<Appointment__c> appointments) {

    List<Doctor__c> docs = [
        SELECT Id FROM Doctor__c
        WHERE Availability__c = true
        LIMIT 1
    ];

    for (Appointment__c app : appointments) {
        if (app.Doctor__c == null && !docs.isEmpty()) {
            app.Doctor__c = docs[0].Id;
        }
    }
}

    // ✅ DELETE
    @AuraEnabled
    public static void deleteAppointment(Id appointmentId) {
        delete [SELECT Id FROM Appointment__c WHERE Id = :appointmentId LIMIT 1];
    }

    // ✅ DROPDOWNS
    @AuraEnabled(cacheable=true)
    public static List<Patinet__c> getPatients() {
        return [SELECT Id, Name FROM Patinet__c LIMIT 50];
    }

    @AuraEnabled(cacheable=true)
    public static List<Doctor__c> getDoctors() {
        return [SELECT Id, Name FROM Doctor__c WHERE Availability__c = true];
    }
}