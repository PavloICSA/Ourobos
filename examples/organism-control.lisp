; Organism Control Program
; Demonstrates interaction with ChimeraOS state

; Define a function to boost organism energy
(def boost-energy (lambda (amount)
  (call-js "update-state" (list "energy" amount))))

; Define a function to adjust mutation rate
(def set-mutation-rate (lambda (rate)
  (call-js "update-state" (list "mutationRate" rate))))

; Define a function to evolve the organism
(def evolve-organism (lambda (steps)
  (call-js "evolve" steps)))

; Example: Boost energy by 20 units
(boost-energy 20)

; Example: Set mutation rate to 0.1
(set-mutation-rate 0.1)

; Example: Evolve for 5 steps
(evolve-organism 5)
