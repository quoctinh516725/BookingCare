package com.dailycodework.beautifulcare.config;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.util.UUID;

public class CustomIdGenerator implements IdentifierGenerator {

    @Override
    public Object generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        // Generate a UUID and remove hyphens
        return UUID.randomUUID().toString().replace("-", "");
    }
}