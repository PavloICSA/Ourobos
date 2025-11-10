C     OuroborOS-Chimera Fortran Numeric Engine
C     High-performance mathematical computations for organism simulation
C     
C     This module provides:
C     - INTEGRATE: Differential equation integration (Euler method)
C     - LOGISTIC_GROWTH: Population growth with carrying capacity
C     - MUTATION_PROB: Mutation probability calculation
C
C     All functions handle edge cases (NaN, infinity) gracefully

C     ================================================================
C     INTEGRATE - Integrate differential equations using Euler method
C     ================================================================
C     Parameters:
C       STATE(N)  - Input state vector
C       DT        - Time step
C       N         - Array size
C       RESULT(N) - Output integrated state
C
      SUBROUTINE INTEGRATE(STATE, DT, N, RESULT)
      IMPLICIT NONE
      INTEGER N, I
      REAL*8 STATE(N), DT, RESULT(N)
      REAL*8 DERIVATIVE, VALUE
      
C     Check for invalid time step
      IF (DT .NE. DT) THEN
C       DT is NaN
        DO I = 1, N
          RESULT(I) = 0.0D0
        END DO
        RETURN
      END IF
      
C     Euler integration: result = state + dt * f(state)
C     Using simple derivative: f(x) = 0.1 * x
      DO I = 1, N
        VALUE = STATE(I)
        
C       Check for NaN or infinity
        IF (VALUE .NE. VALUE) THEN
C         Value is NaN
          RESULT(I) = 0.0D0
        ELSE IF (VALUE .GT. 1.0D308) THEN
C         Value is too large (near infinity)
          RESULT(I) = 1.0D308
        ELSE IF (VALUE .LT. -1.0D308) THEN
C         Value is too small (near negative infinity)
          RESULT(I) = -1.0D308
        ELSE
C         Normal computation
          DERIVATIVE = 0.1D0 * VALUE
          RESULT(I) = VALUE + DT * DERIVATIVE
          
C         Clamp result to prevent overflow
          IF (RESULT(I) .GT. 1.0D308) THEN
            RESULT(I) = 1.0D308
          ELSE IF (RESULT(I) .LT. -1.0D308) THEN
            RESULT(I) = -1.0D308
          END IF
        END IF
      END DO
      
      RETURN
      END

C     ================================================================
C     LOGISTIC_GROWTH - Calculate logistic growth rate
C     ================================================================
C     Formula: rate * population * (1 - population / capacity)
C     
C     Parameters:
C       POP      - Current population
C       RATE     - Growth rate
C       CAPACITY - Carrying capacity
C     Returns:
C       Growth value
C
      REAL*8 FUNCTION LOGISTIC_GROWTH(POP, RATE, CAPACITY)
      IMPLICIT NONE
      REAL*8 POP, RATE, CAPACITY
      REAL*8 RATIO, FACTOR
      
C     Check for NaN inputs
      IF (POP .NE. POP .OR. RATE .NE. RATE .OR. 
     &    CAPACITY .NE. CAPACITY) THEN
        LOGISTIC_GROWTH = 0.0D0
        RETURN
      END IF
      
C     Check for zero or negative capacity
      IF (CAPACITY .LE. 0.0D0) THEN
        LOGISTIC_GROWTH = 0.0D0
        RETURN
      END IF
      
C     Check for infinity
      IF (POP .GT. 1.0D308 .OR. POP .LT. -1.0D308) THEN
        LOGISTIC_GROWTH = 0.0D0
        RETURN
      END IF
      
C     Calculate logistic growth
      RATIO = POP / CAPACITY
      FACTOR = 1.0D0 - RATIO
      
C     Clamp factor to [0, 1] range
      IF (FACTOR .LT. 0.0D0) THEN
        FACTOR = 0.0D0
      ELSE IF (FACTOR .GT. 1.0D0) THEN
        FACTOR = 1.0D0
      END IF
      
      LOGISTIC_GROWTH = RATE * POP * FACTOR
      
C     Check for overflow in result
      IF (LOGISTIC_GROWTH .NE. LOGISTIC_GROWTH) THEN
        LOGISTIC_GROWTH = 0.0D0
      ELSE IF (LOGISTIC_GROWTH .GT. 1.0D308) THEN
        LOGISTIC_GROWTH = 1.0D308
      ELSE IF (LOGISTIC_GROWTH .LT. -1.0D308) THEN
        LOGISTIC_GROWTH = -1.0D308
      END IF
      
      RETURN
      END

C     ================================================================
C     MUTATION_PROB - Calculate mutation probability
C     ================================================================
C     Formula: base_rate * exp(-energy / temperature)
C     Higher energy = lower mutation rate (stable state)
C     
C     Parameters:
C       ENERGY      - Current energy level
C       BASE_RATE   - Base mutation rate
C       TEMPERATURE - Temperature parameter
C     Returns:
C       Mutation probability [0, 1]
C
      REAL*8 FUNCTION MUTATION_PROB(ENERGY, BASE_RATE, TEMPERATURE)
      IMPLICIT NONE
      REAL*8 ENERGY, BASE_RATE, TEMPERATURE
      REAL*8 EXPONENT, PROB
      
C     Check for NaN inputs
      IF (ENERGY .NE. ENERGY .OR. BASE_RATE .NE. BASE_RATE .OR.
     &    TEMPERATURE .NE. TEMPERATURE) THEN
        MUTATION_PROB = 0.0D0
        RETURN
      END IF
      
C     Check for zero or negative temperature
      IF (TEMPERATURE .LE. 0.0D0) THEN
        MUTATION_PROB = BASE_RATE
        RETURN
      END IF
      
C     Check for infinity
      IF (ENERGY .GT. 1.0D308 .OR. ENERGY .LT. -1.0D308) THEN
        MUTATION_PROB = 0.0D0
        RETURN
      END IF
      
C     Calculate exponent, clamping to prevent overflow
      EXPONENT = -ENERGY / TEMPERATURE
      
C     Clamp exponent to reasonable range for exp()
      IF (EXPONENT .LT. -100.0D0) THEN
        EXPONENT = -100.0D0
      ELSE IF (EXPONENT .GT. 100.0D0) THEN
        EXPONENT = 100.0D0
      END IF
      
C     Calculate probability
      PROB = BASE_RATE * EXP(EXPONENT)
      
C     Clamp to [0, 1] range
      IF (PROB .LT. 0.0D0) THEN
        MUTATION_PROB = 0.0D0
      ELSE IF (PROB .GT. 1.0D0) THEN
        MUTATION_PROB = 1.0D0
      ELSE IF (PROB .NE. PROB) THEN
C       Result is NaN
        MUTATION_PROB = 0.0D0
      ELSE
        MUTATION_PROB = PROB
      END IF
      
      RETURN
      END
