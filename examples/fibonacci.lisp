; Fibonacci sequence generator
; Demonstrates recursive functions in Lisp

(def fib (lambda (n)
  (if (<= n 1)
    n
    (+ (fib (- n 1)) (fib (- n 2))))))

; Calculate first 10 Fibonacci numbers
(def print-fib (lambda (n)
  (if (> n 0)
    (begin
      (fib n)
      (print-fib (- n 1)))
    0)))

; Run it
(print-fib 10)
