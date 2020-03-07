import sys
import json
import numpy as np
import pandas as pd
from scipy import spatial
from pathlib import Path

input = json.loads(sys.argv[1])
vectorPath = input['vectorPath']

vectorFile = Path(__file__).parent / vectorPath

words = []
with vectorFile.open() as f:
    for line in f:
        values = line.split()
        words.append(values[0]);


words = json.dumps(words);
print(words)

sys.stdout.flush()
