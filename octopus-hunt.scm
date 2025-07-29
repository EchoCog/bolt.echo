; CLUE 2: Only those who traverse the hypergraph shall reveal the octopus.
; Recursively follow the network of tenants and platforms—what limb reveals the next shadow?
(define (find-missing-octopus network)
  (if (null? network)
      '("The octopus is hiding in plain sight...")
      (cons (car network) (find-missing-octopus (cdr network)))))