package fr.jeroka.apijava.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Aspect
@Component
public class LoggingAspect {

    private static final String PC = "execution(* fr.jeroka.apijava..*Controller.*(..)) "
            + "|| execution(* fr.jeroka.apijava..*Service.*(..)) "
            + "|| @annotation(fr.jeroka.apijava.aop.LogExecution)";

    @Around(PC)
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        var log = LoggerFactory.getLogger(joinPoint.getTarget().getClass());
        var method = joinPoint.getSignature() instanceof MethodSignature sig ? sig.getMethod().getName() : joinPoint.getSignature().getName();
        var target = joinPoint.getTarget().getClass().getSimpleName();
        var args = joinPoint.getArgs();
        if (log.isDebugEnabled()) {
            log.debug("Entrée {}#{} args={}", target, method, Arrays.toString(args));
        }
        var start = System.currentTimeMillis();
        try {
            var result = joinPoint.proceed();
            var duration = System.currentTimeMillis() - start;
            logDuration(log, target, method, duration);
            return result;
        } catch (Throwable t) {
            log.error("Erreur {}#{}: {}", target, method, t.getMessage());
            throw t;
        }
    }

    private static void logDuration(Logger log, String target, String method, long durationMs) {
        if (durationMs > 1000) {
            log.warn("Méthode lente {}#{} en {} ms", target, method, durationMs);
        } else if (log.isDebugEnabled()) {
            log.debug("Sortie {}#{} en {} ms", target, method, durationMs);
        }
    }
}
