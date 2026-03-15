package fr.jeroka.apijava.service;

import fr.jeroka.apijava.entity.Person;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.AppointmentRepository;
import fr.jeroka.apijava.repository.InvoiceRepository;
import fr.jeroka.apijava.repository.MessageRepository;
import fr.jeroka.apijava.repository.PersonRepository;
import fr.jeroka.apijava.repository.QuoteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class PersonService {

    private final PersonRepository personRepository;
    private final InvoiceRepository invoiceRepository;
    private final QuoteRepository quoteRepository;
    private final MessageRepository messageRepository;
    private final AppointmentRepository appointmentRepository;

    public PersonService(PersonRepository personRepository,
                         InvoiceRepository invoiceRepository,
                         QuoteRepository quoteRepository,
                         MessageRepository messageRepository,
                         AppointmentRepository appointmentRepository) {
        this.personRepository = personRepository;
        this.invoiceRepository = invoiceRepository;
        this.quoteRepository = quoteRepository;
        this.messageRepository = messageRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public Page<Person> findByCompanyId(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        return personRepository.findByCompanyId(companyId, p);
    }

    public Person getByIdAndCompanyId(UUID id, UUID companyId) {
        return personRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Personne introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Person create(Person person) {
        if (personRepository.existsByCompanyIdAndEmail(person.getCompanyId(), person.getEmail())) {
            throw new ApiException("Une personne existe déjà avec cet email pour cette entreprise", HttpStatus.CONFLICT);
        }
        return personRepository.save(person);
    }

    @Transactional
    public Person update(Person person) {
        return personRepository.save(person);
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        personRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Personne introuvable", HttpStatus.NOT_FOUND));

        List<String> refs = new ArrayList<>();
        if (invoiceRepository.existsByPersonId(id)) refs.add("factures");
        if (quoteRepository.existsByPersonId(id)) refs.add("devis");
        if (messageRepository.existsByPersonId(id)) refs.add("messages");
        if (appointmentRepository.existsByPersonId(id)) refs.add("rendez-vous");

        if (!refs.isEmpty()) {
            String msg = "Impossible de supprimer : ce client a des " + String.join(", ", refs) + " associés.";
            throw new ApiException(msg, HttpStatus.CONFLICT);
        }

        personRepository.deleteById(id);
    }

    public long countByCompanyId(UUID companyId) {
        return personRepository.countByCompanyId(companyId);
    }

    public long countByCompanyIdAndStatus(UUID companyId, String status) {
        return personRepository.countByCompanyIdAndStatus(companyId, status);
    }
}
