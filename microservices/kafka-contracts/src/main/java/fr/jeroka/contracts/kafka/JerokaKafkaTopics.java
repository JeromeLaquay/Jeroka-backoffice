package fr.jeroka.contracts.kafka;

/**
 * Noms des topics Kafka par domaine (alignés sur le découpage microservices).
 */
public final class JerokaKafkaTopics {

    /* --- Auth --- */
    public static final String AUTH_USER_CREATED = "jeroka.auth.user.created";
    public static final String AUTH_USER_UPDATED = "jeroka.auth.user.updated";

    /* --- Organization --- */
    public static final String ORGANIZATION_COMPANY_UPDATED = "jeroka.organization.company.updated";
    public static final String ORGANIZATION_SOCIAL_CREDENTIAL_UPSERTED = "jeroka.organization.social-credential.upserted";

    /* --- CRM --- */
    public static final String CRM_PERSON_CREATED = "jeroka.crm.person.created";
    public static final String CRM_PERSON_UPDATED = "jeroka.crm.person.updated";
    public static final String CRM_PERSON_DELETED = "jeroka.crm.person.deleted";
    public static final String CRM_MESSAGE_RECEIVED = "jeroka.crm.message.received";

    /* --- Catalog --- */
    public static final String CATALOG_PRODUCT_CREATED = "jeroka.catalog.product.created";
    public static final String CATALOG_PRODUCT_UPDATED = "jeroka.catalog.product.updated";
    public static final String CATALOG_PRODUCT_DELETED = "jeroka.catalog.product.deleted";
    public static final String CATALOG_PRODUCT_STOCK_CHANGED = "jeroka.catalog.product.stock-changed";

    /* --- Billing --- */
    public static final String BILLING_QUOTE_ACCEPTED = "jeroka.billing.quote.accepted";
    public static final String BILLING_INVOICE_ISSUED = "jeroka.billing.invoice.issued";
    public static final String BILLING_INVOICE_PAID = "jeroka.billing.invoice.paid";

    /* --- Scheduling --- */
    public static final String SCHEDULING_APPOINTMENT_BOOKED = "jeroka.scheduling.appointment.booked";
    public static final String SCHEDULING_APPOINTMENT_CANCELLED = "jeroka.scheduling.appointment.cancelled";
    public static final String SCHEDULING_APPOINTMENT_CONFIRMED = "jeroka.scheduling.appointment.confirmed";

    /* --- Content --- */
    public static final String CONTENT_PUBLICATION_PUBLISHED = "jeroka.content.publication.published";
    public static final String CONTENT_PUBLICATION_SCHEDULED = "jeroka.content.publication.scheduled";

    /* --- Email --- */
    public static final String EMAIL_SYNC_REQUESTED = "jeroka.email.sync.requested";
    public static final String EMAIL_SYNC_COMPLETED = "jeroka.email.sync.completed";
    public static final String EMAIL_CATEGORY_CREATED = "jeroka.email.category.created";
    public static final String EMAIL_CATEGORY_DELETED = "jeroka.email.category.deleted";
    public static final String EMAIL_SENDER_ASSIGNED = "jeroka.email.sender.assigned";

    /* --- Docs --- */
    public static final String DOCS_DOCUMENT_UPLOADED = "jeroka.docs.document.uploaded";
    public static final String DOCS_DOCUMENT_ANALYZED = "jeroka.docs.document.analyzed";

    /* --- IA / documents (commande asynchrone) --- */
    public static final String IA_DOCUMENT_REQUESTED = "jeroka.ia.document.requested";

    private JerokaKafkaTopics() {}
}
