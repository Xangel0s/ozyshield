package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"sync"
)

// Team represents a group of operators for incident assignment.
type Team struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Color   string   `json:"color"`
	Members []string `json:"members"`
}

// TeamStore is an in-memory thread-safe store for teams.
type TeamStore struct {
	mu    sync.RWMutex
	teams map[string]Team
}

// NewTeamStore initializes an empty TeamStore.
func NewTeamStore() *TeamStore {
	return &TeamStore{
		teams: make(map[string]Team),
	}
}

func (ts *TeamStore) list() []Team {
	ts.mu.RLock()
	defer ts.mu.RUnlock()
	list := make([]Team, 0, len(ts.teams))
	for _, t := range ts.teams {
		list = append(list, t)
	}
	return list
}

func (ts *TeamStore) get(id string) (Team, bool) {
	ts.mu.RLock()
	defer ts.mu.RUnlock()
	t, ok := ts.teams[id]
	return t, ok
}

func (ts *TeamStore) create(t Team) Team {
	ts.mu.Lock()
	defer ts.mu.Unlock()
	ts.teams[t.ID] = t
	return t
}

func (ts *TeamStore) update(id string, t Team) (Team, bool) {
	ts.mu.Lock()
	defer ts.mu.Unlock()
	if _, ok := ts.teams[id]; !ok {
		return Team{}, false
	}
	t.ID = id
	ts.teams[id] = t
	return t, true
}

func (ts *TeamStore) delete(id string) bool {
	ts.mu.Lock()
	defer ts.mu.Unlock()
	if _, ok := ts.teams[id]; !ok {
		return false
	}
	delete(ts.teams, id)
	return true
}

// ServerAPI extensions for Teams

// ListTeams returns all teams.
func (api *ServerAPI) ListTeams(w http.ResponseWriter, r *http.Request) {
	teams := api.teams.list()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(teams)
}

// CreateTeam adds a new team.
func (api *ServerAPI) CreateTeam(w http.ResponseWriter, r *http.Request) {
	var t Team
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}
	if t.Name == "" {
		http.Error(w, "Missing name", http.StatusBadRequest)
		return
	}
	if t.ID == "" {
		t.ID = "team_" + strings.ToLower(strings.ReplaceAll(t.Name, " ", "_"))
	}
	if t.Color == "" {
		t.Color = "#6b7280"
	}
	created := api.teams.create(t)
	log.Printf("[Server] Team created: %s", created.Name)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(created)
}

// UpdateTeam updates an existing team.
func (api *ServerAPI) UpdateTeam(w http.ResponseWriter, r *http.Request) {
	teamID := r.PathValue("id")
	var t Team
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, "Invalid JSON: "+err.Error(), http.StatusBadRequest)
		return
	}
	updated, ok := api.teams.update(teamID, t)
	if !ok {
		http.Error(w, "Team not found", http.StatusNotFound)
		return
	}
	log.Printf("[Server] Team updated: %s", updated.Name)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updated)
}

// DeleteTeam removes a team.
func (api *ServerAPI) DeleteTeam(w http.ResponseWriter, r *http.Request) {
	teamID := r.PathValue("id")
	if !api.teams.delete(teamID) {
		http.Error(w, "Team not found", http.StatusNotFound)
		return
	}
	log.Printf("[Server] Team deleted: %s", teamID)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}
