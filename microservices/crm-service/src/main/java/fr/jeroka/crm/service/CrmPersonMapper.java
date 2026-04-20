package fr.jeroka.crm.service;

import fr.jeroka.crm.entity.CrmPersonEntity;
import fr.jeroka.crm.web.dto.CreatePersonRequestDto;
import fr.jeroka.crm.web.dto.PersonResponseDto;
import fr.jeroka.crm.web.dto.UpdatePersonRequestDto;

import java.util.UUID;

/**
 * Mapping entité ↔ DTO personnes.
 */
final class CrmPersonMapper {

    private CrmPersonMapper() {}

    static PersonResponseDto toResponse(CrmPersonEntity p) {
        return new PersonResponseDto(
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
                p.getUpdatedAt());
    }

    static CrmPersonEntity toNewEntity(UUID companyId, CreatePersonRequestDto req) {
        var p = new CrmPersonEntity();
        p.setId(UUID.randomUUID());
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

    static void applyUpdate(CrmPersonEntity p, UpdatePersonRequestDto req) {
        if (req.typeClient() != null) {
            p.setTypeClient(req.typeClient());
        }
        if (req.firstName() != null) {
            p.setFirstName(trim(req.firstName()));
        }
        if (req.lastName() != null) {
            p.setLastName(trim(req.lastName()));
        }
        if (req.email() != null) {
            p.setEmail(req.email().trim().toLowerCase());
        }
        if (req.companyName() != null) {
            p.setCompanyName(trim(req.companyName()));
        }
        if (req.phone() != null) {
            p.setPhone(trim(req.phone()));
        }
        if (req.mobile() != null) {
            p.setMobile(trim(req.mobile()));
        }
        if (req.website() != null) {
            p.setWebsite(trim(req.website()));
        }
        if (req.addressLine1() != null) {
            p.setAddressLine1(trim(req.addressLine1()));
        }
        if (req.addressLine2() != null) {
            p.setAddressLine2(trim(req.addressLine2()));
        }
        if (req.city() != null) {
            p.setCity(trim(req.city()));
        }
        if (req.postalCode() != null) {
            p.setPostalCode(trim(req.postalCode()));
        }
        if (req.country() != null) {
            p.setCountry(trim(req.country()));
        }
        if (req.siret() != null) {
            p.setSiret(trim(req.siret()));
        }
        if (req.vatNumber() != null) {
            p.setVatNumber(trim(req.vatNumber()));
        }
        if (req.status() != null) {
            p.setStatus(req.status());
        }
        if (req.source() != null) {
            p.setSource(trim(req.source()));
        }
        if (req.notes() != null) {
            p.setNotes(trim(req.notes()));
        }
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
