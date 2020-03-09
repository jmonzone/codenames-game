import sys
import json

import numpy as np
import pandas as pd
from scipy import spatial

N = 5000

with open("/Users/johnnanmonzon/Documents/web-projects/codenames/python/top_5000.txt", "r+") as f:
    d = [next(f) for x in range(N)]
    f.seek(0)
    for i in d:
        f.write(i)
    f.truncate()
