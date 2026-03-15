package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.person.*;

import fr.jeroka.apijava.entity.Person;
import fr.jeroka.apijava.service.PersonService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PersonMappingService {

    private final PersonService personService;

    public PersonMappingService(PersonService personService) {
        this.personService = personService;
    }

    public PageDto<PersonResponse> listByCompany(UUID companyId, int page, int limit) {
        var p = personService.findByCompanyId(companyId, page, limit);
        var items = p.getContent().stream().map(this::toResponse).toList();
        return PageDto.of(items, page, limit, p.getTotalElements());
    }

    public PersonResponse getById(UUID id, UUID companyId) {
        return toResponse(personService.getByIdAndCompanyId(id, companyId));
    }

    public PersonResponse create(UUID companyId, CreatePersonRequest request) {
        var person = toEntity(companyId, request);
        return toResponse(personService.create(person));
    }

    public PersonResponse update(UUID id, UUID companyId, UpdatePersonRequest request) {
        var person = personService.getByIdAndCompanyId(id, companyId);
        applyUpdate(person, request);
        return toResponse(personService.update(person));
    }

    public void delete(UUID id, UUID companyId) {
        personService.delete(id, companyId);
    }

    public PersonStatsResponse getStats(UUID companyId) {
        var total = personService.countByCompanyId(companyId);
        var active = personService.countByCompanyIdAndStatus(companyId, "active");
        var inactive = personService.countByCompanyIdAndStatus(companyId, "inactive");
        var prospect = personService.countByCompanyIdAndStatus(companyId, "prospect");
        return new PersonStatsResponse(total, active, inactive, prospect);
    }

    public PersonResponse toResponse(Person p) {
        return new PersonResponse(
                p.getId().toString(),
                p.getType(),
                p.getTypeClient(),
                p.getFirstName(),
                p.getLastName(),
                p.getCompanyName(),
                p.getEmail(),
                p.getPhone(),
                p.getMobile(),
                p.getStatus(),
                p.getCity(),
                p.getPostalCode(),
                p.getCountry(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    private Person toEntity(UUID companyId, CreatePersonRequest req) {
        var p = new Person();
        p.setCompanyId(companyId);
        p.setType("client");
        p.setTypeClient(req.typeClient() != null ? req.typeClient() : "individual");
        p.setFirstName(trim(req.firstName()));
        p.setLastName(trim(req.lastName()));
        p.setEmail(trim(req.email()).toLowerCase());
        p.setCompanyName(trim(req.companyName()));
        p.setPhone(trim(req.phone()));
        p.setMobile(trim(req.mobile()));
        p.setWebsite(trim(req.website()));
        p.setAddressLine1(trim(req.addressLine1()));
        p.setAddressLine2(trim(req.addressLine2()));
        p.setCity(trim(req.city()));
        p.setPostalCode(trim(req.postalCode()));
        p.setCountry(req.country() != null ? trim(req.country()) : "France");
        p.setSiret(trim(req.siret()));
        p.setVatNumber(trim(req.vatNumber()));
        p.setStatus(req.status() != null ? req.status() : "active");
        p.setSource(trim(req.source()));
        p.setNotes(trim(req.notes()));
        return p;
    }

    private void applyUpdate(Person p, UpdatePersonRequest req) {
        if (req.typeClient() != null) p.setTypeClient(req.typeClient());
        if (req.firstName() != null) p.setFirstName(trim(req.firstName()));
        if (req.lastName() != null) p.setLastName(trim(req.lastName()));
        if (req.email() != null) p.setEmail(req.email().trim().toLowerCase());
        if (req.companyName() != null) p.setCompanyName(trim(req.companyName()));
        if (req.phone() != null) p.setPhone(trim(req.phone()));
        if (req.mobile() != null) p.setMobile(trim(req.mobile()));
        if (req.website() != null) p.setWebsite(trim(req.website()));
        if (req.addressLine1() != null) p.setAddressLine1(trim(req.addressLine1()));
        if (req.addressLine2() != null) p.setAddressLine2(trim(req.addressLine2()));
        if (req.city() != null) p.setCity(trim(req.city()));
        if (req.postalCode() != null) p.setPostalCode(trim(req.postalCode()));
        if (req.country() != null) p.setCountry(trim(req.country()));
        if (req.siret() != null) p.setSiret(trim(req.siret()));
        if (req.vatNumber() != null) p.setVatNumber(trim(req.vatNumber()));
        if (req.status() != null) p.setStatus(req.status());
        if (req.source() != null) p.setSource(trim(req.source()));
        if (req.notes() != null) p.setNotes(trim(req.notes()));
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
