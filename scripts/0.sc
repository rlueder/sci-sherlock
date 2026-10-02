;;; The Stopped Clocks: Holmes, his voice, the interface, and the title screen before 221B.
(script 0)
(include "system.sh")
(public sherlock 0)

(class Sherlock of Game
  (method (init)
    (super init:)
    ;; The interface (r20): the dialogue font, ink on paper inside the box frame, a cursor
    ;; for each verb and one for waiting, and the icon bar's icons.
    (textStyle font: 1 fore: 2 back: 62 frame: 260)
    (user walkCursor: 261 lookCursor: 262 doCursor: 263 talkCursor: 264 waitCursor: 265)
    (iconBar view: 266)
    (= ego holmes)
    (= heroTalker holmesVoice)
    ;; Narration and Holmes at the foot of the screen, growing upwards with longer lines.
    (narrator y: -4 width: 294)
    (self newRoom: 104)))

(instance sherlock of Sherlock)
;; Standing still, he idles now and then (view 206: the pipe, thinking, his cap, his watch).
(instance holmes of Ego
  (properties view 200 xStep 2 yStep 1 moveSpeed 2 cycleSpeed 8 idleView 206 idleAfter 10))
(instance holmesVoice of Talker
  (properties name "Holmes" y -4 width 294))
