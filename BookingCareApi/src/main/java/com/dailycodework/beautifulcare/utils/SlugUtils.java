package com.dailycodework.beautifulcare.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility class for creating URL-friendly slugs from strings
 */
public class SlugUtils {
    
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGESDHASHES = Pattern.compile("(^-|-$)");
    
    /**
     * Convert a string to a URL-friendly slug
     * 
     * @param input The string to convert
     * @return A URL-friendly slug
     */
    public static String createSlug(String input) {
        if (input == null) return "";
        
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = slug.toLowerCase(Locale.ENGLISH);
        slug = EDGESDHASHES.matcher(slug).replaceAll("");
        
        // Replace Vietnamese characters
        slug = slug.replace("đ", "d").replace("Đ", "d");
        
        return slug;
    }
} 