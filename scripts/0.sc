;;; The Stopped Clocks: Holmes, his voice, and the first room, 221B.
(script 0)
(include "system.sh")
(public sherlock 0)

(class Sherlock of Game
  (method (init)
    (super init:)
    (= ego holmes)
    (= heroTalker holmesVoice)
    (narrator y: 154 width: 294)
    (self newRoom: 100)))

(instance sherlock of Sherlock)
;; Standing still, he idles now and then (view 206: the pipe, thinking, his cap, his watch).
(instance holmes of Ego
  (properties view 200 xStep 2 yStep 1 moveSpeed 2 cycleSpeed 8 idleView 206 idleAfter 10))
(instance holmesVoice of Talker
  (properties name "Holmes" y 154 width 294))
