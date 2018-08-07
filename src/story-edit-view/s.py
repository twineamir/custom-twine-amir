import numpy as np
from numpy.linalg import inv
from numpy import random
import matplotlib
import matplotlib.pyplot as plt
import time
import datetime
import matplotlib.image as mpimg
from sklearn.naive_bayes import MultinomialNB, GaussianNB,
,→ BernoulliNB
from sklearn.svm import SVC, NuSVC, LinearSVC
from sklearn.metrics import confusion_matrix
from collections import Counter
import os
import shutil
from shutil import copyfile
import re
import nltk
from nltk import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from nltk.tokenize import RegexpTokenizer