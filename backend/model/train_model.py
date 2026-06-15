import pandas as pd
import torch
from sklearn.model_selection import train_test_split

# Prepare data + features ---------------------------
# ---------------------------
def format_raw_training_data():
    """ Extracts data from training data file and returns model-formatted datatypes"""

    data = pd.read_csv("/training_data/training_data.csv")
    # print(data.shape)
    # print(data.head(2))

    all_team_ids = sorted(data['home_team'].unique())
    team_to_index = {team_id: index for index, team_id in enumerate(all_team_ids)}

    data['home_index'] = data['home_team'].map(team_to_index)
    data['away_index'] = data['away_team'].map(team_to_index)

    # print(data[['home_team', 'home_index', 'away_team', 'away_index']].head(3))

    numeric_cols = [
        'home_win_pct', 'home_win_pct_l10', 'home_win_pct_home',
        'home_days_rest', 'home_h2h_diff',
        'away_win_pct', 'away_win_pct_l10', 'away_win_pct_road',
        'away_days_rest', 'away_h2h_diff'
    ]

    X_num = data[numeric_cols].values
    X_teams = data[['home_index', 'away_index']].values
    y = data["home_win"].values

    # print("Numeric features shape:", X_num.shape)
    # print("team indices shape:", X_teams.shape)
    # print("Target shape:", y.shape)

    
    X_num_train, X_num_test, X_teams_train, X_teams_test, y_train, y_test = train_test_split(
        X_num, X_teams, y, test_size = 0.2, random_state = 42
    )

    # print("Train rows:", len(X_num_train))
    # print("Test rows:", len(X_num_test))

    return X_num_train, X_num_test, X_teams_train, X_teams_test, y_train, y_test, team_to_index


def to_tensors(X_num_train, X_num_test, X_teams_train, X_teams_test, y_train, y_test) -> tuple[torch.tensor]:
    """ Convert all training and test data to torch tensors so algorithms can work """
    return (
        torch.tensor(X_num_train,   dtype=torch.float32),
        torch.tensor(X_num_test,    dtype=torch.float32),
        torch.tensor(X_teams_train, dtype=torch.long),
        torch.tensor(X_teams_test,  dtype=torch.long),
        torch.tensor(y_train,       dtype=torch.float32),
        torch.tensor(y_test,        dtype=torch.float32),
    )


from sklearn.preprocessing import StandardScaler
def scale_features(X_num_train, X_num_test):
    """ Scales the numerical features of the training data to ensure no feature dominates predictions """
    scaler = StandardScaler()
    X_num_train = scaler.fit_transform(X_num_train)
    X_num_test  = scaler.transform(X_num_test)

    # print("Mean of first feature (should be ~0):", X_num_train[:, 0].mean().round(4))
    # print("Std of first feature (should be ~1):",  X_num_train[:, 0].std().round(4))   

    return X_num_train, X_num_test, scaler

# Define model classes ------------------------------------------------------
# ------------------------------------------------------
import torch.nn as nn

class NBAPredictorModel(nn.Module):
    def __init__(self):
        """ Define the layers """
        super().__init__()
        self.team_embedding = nn.Embedding(num_embeddings=30, embedding_dim=5)

        # define layer skeletons
        self.input_layer = nn.Linear(20, 64)
        self.hidden_layer = nn.Linear(64, 32)
        self.output_layer = nn.Linear(32, 1)

        # define activtion function
        self.activation = nn.LeakyReLU()

        # add dropout so model can't memorise training data (can't take same path through neurons)
        self.dropout = nn.Dropout(p=0.5)

    def forward(self, x_num, x_teams):
        """ Define forward pass method for this model """

        team_embeds = self.team_embedding(x_teams)
        team_embeds = team_embeds.view(team_embeds.size(0), -1)
        # print("flattened TE shape -> ", team_embeds.shape)

        x = torch.cat([x_num, team_embeds], dim=1)

        x = self.input_layer(x)
        x = self.activation(x)
        x = self.dropout(x)

        x = self.hidden_layer(x)
        x = self.activation(x)
        x = self.dropout(x)

        x = self.output_layer(x)

        x = torch.sigmoid(x)
        return x

# Train ------------------------------------------------------
# ------------------------------------------------------

from torch.utils.data import DataLoader, TensorDataset
 
def train_neural_network():
    """ Handles all steps of the neural network training and data fitting """
    X_num_train, X_num_test, X_teams_train, X_teams_test, y_train, y_test, team_to_index = format_raw_training_data()
    X_num_train, X_num_test, feature_scaler = scale_features(X_num_train, X_num_test)

    X_num_train_tensor, X_num_test_tensor, X_teams_train_tensor, X_teams_test_tensor, y_train_tensor, y_test_tensor = to_tensors(
        X_num_train, X_num_test, X_teams_train, X_teams_test, y_train, y_test
    )

    # print("\n-----------\n")

    model = NBAPredictorModel()
    model(X_num_train_tensor, X_teams_train_tensor) # initial predictions

    training_dataset = TensorDataset(X_num_train_tensor, X_teams_train_tensor, y_train_tensor)
    train_loader = DataLoader(training_dataset, batch_size=32, shuffle=True) # shuffle the data so NN doesn't pick up on patterns

    loss_function = nn.BCELoss()
    optimiser = torch.optim.Adam(model.parameters(), lr=0.001)

    for epoch in range(200): 
        # epoch = full run through the training data
        model.train()
        for X_num_batch, X_teams_batch, y_batch in train_loader: 
            # one batch of random training samples
            optimiser.zero_grad() # set gradients back to zero so that it doesn't carry over between batches

            predictions = model(X_num_batch, X_teams_batch)
            loss = loss_function(predictions.squeeze(), y_batch)

            loss.backward()
            optimiser.step()

    # evaluate results
    model.eval()
    
    with torch.no_grad():
        test_predictions = model(X_num_test_tensor, X_teams_test_tensor)
        test_predictions = (test_predictions.squeeze() > 0.5).float()
        accuracy = (test_predictions == y_test_tensor).float().mean()
        print(f"Test accuracy: {accuracy:.4f}")

        train_predictions = model(X_num_train_tensor, X_teams_train_tensor)
        train_predictions = (train_predictions.squeeze() > 0.5).float()
        train_accuracy = (train_predictions == y_train_tensor).float().mean()
        print(f"Train accuracy: {train_accuracy:.4f}")

    
    # save the model
    save_model(model, feature_scaler, team_to_index)

import pickle

def save_model(model, scaler, team_to_index):
    try:
        torch.save(model.state_dict(), '/model/nba_match_predictor_model.pt')
        print("model saved")

        with open('/model/scaler.pkl', 'wb') as f:
            pickle.dump(scaler, f)
        
        with open('/model/team_to_index.pkl', 'wb') as f:
            pickle.dump(team_to_index, f)

    except Exception as e:
        print("error -> ", e)

if __name__ == "__main__":
    train_neural_network()