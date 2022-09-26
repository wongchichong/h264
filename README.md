# h264

Compress videos into h264 encoding. !! Windows only

Input files extensions
.mp4, .wmv, .mkv, .vob, .avi, .mov, .flv, .iso, .m4v, .rmvb, .m2ts

Output extension:
~1.mp4

# Run
cd c:\videos
node h264.js .

Files ended with ~1.mpg will not be compress again.

# After compressed

The longest video will be deleted to recycle bin.

In case the compressed video is longer than the original video, 
the compressed video will be deleted to recycle bin, 
and the original video will be renamed to ~1.mpg.

# Software Requirements
install ffmpeg, NVidia drivers

# Software Requirements
NVidia GPU card

