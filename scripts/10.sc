;;; The workshop's mouse: every so often it runs from one piece of furniture to another and
;;; is gone again. Routes and timing are the art study's (art/studies/workshop-r9).
(script 10)
(include "system.sh")

(local
  ;; Three routes, four points each: cabinet to workbench, clock to bench, under the bench.
  [xs 12] = (70 87 99 107 260 244 230 217 100 130 182 224)
  [ys 12] = (146 153 152 138 149 149 149 138 137 145 145 137)
  ;; The view for each stretch: running right, left, away to the right or left.
  [views 9] = (273 273 275 276 276 277 273 273 273)
  [speeds 3] = (2 2 1)
  lastRoute)

;; Runs on the mouse prop (script: Scurry in the room's YAML).
(class Scurry of Script
  (properties
    route 0
    point 0
    seen 0)

  (method (changeState newState)
    (= state newState)
    (switch state
      (0
        (client hide: setCycle: 0)
        ;; The first time soon after the room is entered, then every 18 to 35 seconds.
        (= seconds (if seen (Random 18 35) else (Random 3 6)))
        (= seen 1))
      (1
        ;; Not the same way twice running.
        (= route (mod (+ lastRoute (Random 1 2)) 3))
        (= lastRoute route)
        (= point 0)
        (client posn: [xs (* route 4)] [ys (* route 4)] moveSpeed: [speeds route] xStep: 1 yStep: 1 show:)
        (self cue:))
      (2
        (if (< point 3)
          (client view: [views (+ (* route 3) point)] setLoop: 0 setCycle: Forward)
          (++ point)
          ;; Back to this state when it gets there.
          (-- state)
          (client setMotion: MoveTo [xs (+ (* route 4) point)] [ys (+ (* route 4) point)] self)
         else
          (self changeState: 0))))))
