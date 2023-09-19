if __name__ == '__main__':
    import multiprocessing
    multiprocessing.freeze_support()

    # Your code goes here

import os
import json
import numpy as np
import torch
import torch.nn as nn
from model import NeuralNet
from torch.utils.data import Dataset, DataLoader
from Chatbot import tokenization, stemming, excludePunctuation, bag_of_words, stopWordRemoval, stemminglist

script_dir = os.path.dirname(__file__)
file_path = os.path.join(script_dir, 'traindataset.json')
with open(file_path, 'r') as file:
    intents = json.load(file)

all_words = []
tags = []
xy = []
for intent in intents['intents']:
    tag = intent['tag']
    tags.append(tag)
    for pattern in intent['patterns']:
        w = tokenization(pattern)  #w is a list of words
        w = stopWordRemoval(w) #words is a list of words without stop words
        w = excludePunctuation(w) #words is a list of words without punctuation
        all_words.extend(w) #extending the all_words list with the words in w
        xy.append((w, tag)) #xy is a list of tuples of words and tag
        
ignore_words = ['?', '!', '.', ',']
all_words = [stemming(w) for w in all_words if w not in ignore_words] #stemming all the words in all_words
all_words = sorted(set(all_words)) #sorting all the words in all_words, set is used to remove duplicates
# print(all_words)
tags = sorted(set(tags)) #sorting all the tags, set is used to remove duplicates



X_train = [] #list of bag of words
y_train = [] #list of tags

for (pattern_sentence, tag) in xy: #xy is a list of tuples of words and tag
    bag = bag_of_words(pattern_sentence, all_words) #bag is a list of 0s and 1s
    X_train.append(bag) #appending the bag to X_train list of bag of words list of 0s and 1s 
    label = tags.index(tag) #label is the index of the tag in the tags list 
    y_train.append(label)  #appending the label to y_train list of tags list of indexes of tags in tags list 

X_train = np.array(X_train) #converting the X_train list of bag of words list of 0s and 1s to numpy array
Y_train = np.array(y_train) #converting the y_train list of tags list of indexes of tags in tags list to numpy array


class ChatDataset(Dataset):
    def __init__(self):
        self.n_samples = len(X_train)
        self.x_data = X_train
        self.y_data = Y_train

    # dataset[0]
    def __getitem__(self, index):
        return self.x_data[index], self.y_data[index]

    # len(dataset)
    def __len__(self):
        return self.n_samples
    
    
# Hyperparameters
batch_size = 6
hidden_size = 10 #hidden_size is the number of neurons in the hidden layer
output_size = len(tags)
input_size = len(X_train[0])
learning_rate = 0.001
num_epochs = 1000

dataset = ChatDataset()
train_loader = DataLoader(dataset=dataset, batch_size=batch_size, shuffle=True, num_workers=0)


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = NeuralNet(input_size, hidden_size, output_size).to(device)



# Loss and optimizer
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)

for epoch in range(num_epochs):
    for (words, labels) in train_loader:
        words = words.to(device)
        labels = labels.to(dtype=torch.long).to(device)

        # Forward pass
        outputs = model(words)
        loss = criterion(outputs, labels)

        # Backward and optimize
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    if (epoch + 1) % 100 == 0:
        print(f'epoch {epoch + 1}/{num_epochs}, loss = {loss.item():.4f}')

print(f'final loss, loss = {loss.item():.4f}')

data = {
    "model_state": model.state_dict(),
    "input_size": input_size,
    "output_size": output_size,
    "hidden_size": hidden_size,
    "all_words": all_words,
    "tags": tags
}

FILE = "data.pth"
torch.save(data, FILE)

print(f'training complete. file saved to {FILE}')

# print("###########################################################")
# print(xy)
# print("############################################################")
# print(tags)