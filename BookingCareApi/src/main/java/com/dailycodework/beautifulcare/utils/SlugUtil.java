package com.dailycodework.beautifulcare.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

public class SlugUtil {
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGESDHASHES = Pattern.compile("(^-|-$)");

    private SlugUtil() {
        // Utility class, no instances needed
    }

    /**
     * Generate a URL-friendly slug from a title.
     * The slug will be lowercase, with spaces replaced by hyphens,
     * and all non-alphanumeric characters removed.
     * 
     * @param input The title to convert to a slug
     * @return A URL-friendly slug
     */
    public static String generateSlug(String input) {
        if (input == null || input.isEmpty()) {
            return UUID.randomUUID().toString();
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{M}", "");
        String lowerCase = withoutAccents.toLowerCase(Locale.ENGLISH);
        String noWhitespace = WHITESPACE.matcher(lowerCase).replaceAll("-");
        String noNonLatin = NONLATIN.matcher(noWhitespace).replaceAll("");
        String noEdgeDashes = EDGESDHASHES.matcher(noNonLatin).replaceAll("");

        // Ensure slug is not empty after processing
        if (noEdgeDashes.isEmpty()) {
            return UUID.randomUUID().toString();
        }

        return noEdgeDashes;
    }
}