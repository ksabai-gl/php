package com.company.hr.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * Loads portlet.properties (API URL + key).
 */
public final class PortletConfig {

    private static final Properties PROPS = new Properties();

    static {
        InputStream in = PortletConfig.class.getClassLoader()
                .getResourceAsStream("portlet.properties");
        if (in != null) {
            try {
                PROPS.load(in);
            } catch (IOException e) {
                // fall through to defaults
            } finally {
                try { in.close(); } catch (IOException ignored) { }
            }
        }
    }

    private PortletConfig() { }

    public static String getApiBaseUrl() {
        return PROPS.getProperty("api.base.url", "http://localhost/phpja/api");
    }

    public static String getApiKey() {
        return PROPS.getProperty("api.key", "EMP-PORTAL-LEGACY-KEY-2014");
    }

    public static int getConnectTimeout() {
        return Integer.parseInt(PROPS.getProperty("api.connect.timeout.ms", "5000"));
    }

    public static int getReadTimeout() {
        return Integer.parseInt(PROPS.getProperty("api.read.timeout.ms", "10000"));
    }
}