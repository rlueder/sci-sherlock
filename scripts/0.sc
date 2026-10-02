;;; The Stopped Clocks: Holmes, his voice, the interface, and the title screen before 221B.
(script 0)
(include "system.sh")
(public sherlock 0)

(class Sherlock of Game
  (method (init)
    (super init:)
    ;; The interface: New Century Schoolbook (r29: font 1, and 3 bold for speakers' names),
    ;; ink on paper inside the r20 box frame, r20's cursors, and r28's painted toolbar and
    ;; case (views 267 and 268) with its 32-pixel icons.
    (textStyle font: 1 nameFont: 3 fore: 2 back: 62 frame: 260)
    ;; Portraits (r23) in their gilt frame (view 214), at the top on either side.
    (textStyle portraitFrame: 214 portraitX: 12 portraitY: 22)
    (user walkCursor: 261 lookCursor: 262 doCursor: 263 talkCursor: 264 waitCursor: 265)
    (iconBar view: 266 skin: 267 size: 32 left: 16 spacing: 42 top: 8)
    (inventory skin: 268 x: 32 y: 30 cols: 4 slotLeft: 13 slotTop: 28 slotWidth: 60 slotHeight: 47 inset: 7 iconSize: 32)
    (= ego holmes)
    (= heroTalker holmesVoice)
    ;; Narration at the foot of the screen, growing upwards with longer lines.
    (narrator y: -4 width: 294)
    (self newRoom: 104)))

(instance sherlock of Sherlock)
;; Standing still, he idles now and then (view 206: the pipe, thinking, his cap, his watch).
(instance holmes of Ego
  (properties view 200 xStep 2 yStep 1 moveSpeed 2 cycleSpeed 8 idleView 206 idleAfter 10))
;; His lines come with his portrait (view 213), opposite whoever he's talking to.
(instance holmesVoice of PortraitTalker
  (properties name "Holmes" view 213))
