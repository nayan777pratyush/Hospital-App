public with sharing class AppointmentService {

@AuraEnabled(cacheable=true)
public static List<Appointment__c> getAppointments() {
    return [
        SELECT Id, Name, Status__c, Appointment_Date_Time__c,
               Doctor__c, Patinet__c,
               Doctor__r.Name, Patinet__r.Name
        FROM Appointment__c
        ORDER BY Date__c DESC
        LIMIT 50
    ];
}
    @AuraEnabled
    public static void createAppointment(Id patientId, Id doctorId, Date appointmentDate, String status) {
        Appointment__c app = new Appointment__c(
            Patinet__c = patientId,
            Doctor__c = doctorId,
            Appointment_Date_Time__c = appointmentDate,
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

    @AuraEnabled(cacheable=true)
public static List<Patinet__c> getPatients() {
    return [SELECT Id, Name FROM Patinet__c LIMIT 50];
}

@AuraEnabled(cacheable=true)
public static List<Doctor__c> getDoctors() {
    return [SELECT Id, Name FROM Doctor__c WHERE Availability__c = true];
}
@AuraEnabled
public static void deleteAppointment(Id appointmentId) {
    if (appointmentId == null) return;

    List<Appointment__c> apps = [
        SELECT Id FROM Appointment__c WHERE Id = :appointmentId LIMIT 1
    ];

    if (!apps.isEmpty()) {
        delete apps;
    }
}

@AuraEnabled
public static void updateAppointment(
    Id recordId,
    Id patientId,
    Id doctorId,
    Date dateValue,
    String status
) {
    Appointment__c appt = [
        SELECT Id, Patinet__c, Doctor__c, Appointment_Date_Time__c, Status__c
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
}