@isTest
public class AppointmentTest {

    @isTest
    static void testAssignDoctor() {

        // Create Doctor
        Doctor__c doc = new Doctor__c(
            Name = 'Dr Test',
            Availability__c = true
        );
        insert doc;

        // Create Patient
        Patinet__c pat = new Patinet__c(
            Name = 'Test Patient'
        );
        insert pat;

        // Create Appointment (NO doctor assigned yet)
        Appointment__c app = new Appointment__c(
            Patinet__c = pat.Id,
            Appointment_Date_Time__c = System.now(),
            Status__c = 'Pending'
        );
        insert app;

        // 🔥 CALL YOUR METHOD (IMPORTANT)
        List<Appointment__c> apps = [
            SELECT Id, Doctor__c
            FROM Appointment__c
            WHERE Id = :app.Id
        ];

        AppointmentService.assignDoctor(apps);
        update apps;

        // Fetch updated record
        Appointment__c result = [
            SELECT Doctor__c
            FROM Appointment__c
            WHERE Id = :app.Id
        ];

        // Assertion
        System.assertNotEquals(null, result.Doctor__c, 'Doctor should be assigned');
    }
}