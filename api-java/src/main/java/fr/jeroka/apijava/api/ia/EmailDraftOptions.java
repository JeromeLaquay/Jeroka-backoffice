package fr.jeroka.apijava.api.ia;

public record EmailDraftOptions(String tone, String language) {
    public static final String TONE_PROFESSIONNEL = "professionnel";
    public static final String TONE_AMICAL = "amical";
    public static final String TONE_FORMEL = "formel";
    public static final String TONE_CONCIS = "concis";
    public static final String LANG_FR = "fr";
    public static final String LANG_EN = "en";
}
