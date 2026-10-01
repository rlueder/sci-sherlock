;;; Workshop art proof: the first playable slice of The Stopped Clocks.
(script 0)
(include "system.sh")
(public sherlock 0)

(class Sherlock of Game
  (method (init)
    (super init:)
    (= ego holmes)
    (= heroTalker holmesVoice)
    (narrator y: 154 width: 294)
    (self newRoom: 102)))

(instance sherlock of Sherlock)
(instance holmes of Ego
  (properties view 200 xStep 2 yStep 1 moveSpeed 2 cycleSpeed 8))
(instance holmesVoice of Talker
  (properties name "Holmes" y 154 width 294))
