package fr.jeroka.apijava.aop;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Convention : max 3 paramètres par méthode (règle projet).
 * Log un warning si une méthode de Service dépasse.
 */
@Aspect
@Component
public class ServiceContractAspect {

    private static final int MAX_PARAMS = 3;
    private static final Logger log = LoggerFactory.getLogger(ServiceContractAspect.class);

    @Before("execution(* fr.jeroka.apijava..*Service.*(..))")
    public void checkParameterCount(JoinPoint joinPoint) {
        if (!(joinPoint.getSignature() instanceof MethodSignature sig)) return;
        int count = sig.getMethod().getParameterCount();
        if (count > MAX_PARAMS) {
            log.warn("Convention: {}#{} a {} paramètres (max recommandé: {})",
                    joinPoint.getTarget().getClass().getSimpleName(),
                    sig.getMethod().getName(),
                    count,
                    MAX_PARAMS);
        }
    }
}
