;;; The workshop's mouse: every so often it runs under the bench, from one upright of the
;;; work bay to the other, and is gone again. Route and timing are the art study's
;;; (art/studies/environment-r43/guides/workshop-handoff.json).
(script 10)
(include "system.sh")

(local
  west)           ; the way it ran last: 0 east, 1 west

;; Runs on the mouse prop (script: Scurry in the room's YAML). Its view's loop 0 runs east,
;; loop 1 west; both ends are behind the bay's uprights, so it appears and vanishes there.
(class Scurry of Script
  (properties
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
        ;; The other way from last time; across in about three seconds.
        (= west (not west))
        (client
          setLoop: west
          posn: (if west 239 else 93) 135
          moveSpeed: 4 xStep: 3 yStep: 1
          show:
          setCycle: Forward
          setMotion: MoveTo (if west 93 else 239) 135 self))
      (2
        (self changeState: 0)))))
