import React, { useState, useEffect } from 'react';
import { getIssuesOfRepository, addStarToRepository, removeStarFromRepository } from './actions';
import { resolveIssuesQuery, resolveAddStarMutation, resolveRemoveStarMutation } from './reducers';

const TITLE = 'React GraphQL GitHub Client';

const App = () => {
  const [state, setState] = useState({
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: null,
    errors: null
  });

  useEffect(() => {
    onFetchFromGitHub(state.path);
  }, []);

  const onChange = event => {
    setState({ ...state, path: event.target.value });
  };

  const onSubmit = event => {
    onFetchFromGitHub(state.path);

    event.preventDefault();
  };

  const onFetchFromGitHub = (path, cursor) => {
    getIssuesOfRepository(path, cursor).then(queryResult =>
      setState(resolveIssuesQuery(queryResult, cursor, state)),
    );
  };

  const onFetchMoreIssues = () => {
    const { endCursor, } = state.organization.repository.issues.pageInfo;
    onFetchFromGitHub(state.path, endCursor);
  };

  const onStarRepository = (repositoryId, viewerHasStarred) => {
    viewerHasStarred ?
      removeStarFromRepository(repositoryId).then(mutationResult =>
        setState(resolveRemoveStarMutation(mutationResult, state))
      ) :
      addStarToRepository(repositoryId).then(mutationResult =>
        setState(resolveAddStarMutation(mutationResult, state))
      )
  };

  return (
    <div>
      <h1>{TITLE}</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="url">
          Show open issues for https://github.com/
        </label>
        <input
          id="url"
          type="text"
          value={state.path}
          onChange={onChange}
          style={{ width: '300px' }}
        />
        <button type="submit">Search</button>
      </form>
      <hr />
      {state.organization ? (
        <Organization
          organization={state.organization}
          errors={state.errors}
          onFetchMoreIssues={onFetchMoreIssues}
          onStarRepository={onStarRepository}
        />
      ) : (
          <p>No information yet ...</p>
        )}
    </div>
  )
}

const Organization = ({ organization, errors, onFetchMoreIssues, onStarRepository, }) => {
  if (errors) {
    return (
      <p>
        <strong>Something went wrong:</strong>
        {errors.map(error => error.message).join(' ')}
      </p>
    );
  }
  return (
    <div>
      <p>
        <strong>Issues from Organization:</strong>
        <a href={organization.url}>{organization.name}</a>
      </p>
      <Repository
        repository={organization.repository}
        onFetchMoreIssues={onFetchMoreIssues}
        onStarRepository={onStarRepository}
      />
    </div>
  );
};

const Repository = ({ repository, onFetchMoreIssues, onStarRepository, }) => (
  <div>
    <p>
      <strong>In Repository:</strong>
      <a href={repository.url}>{repository.name}</a>
    </p>
    <button
      type="button"
      onClick={() => onStarRepository(repository.id, repository.viewerHasStarred)}
    >
      {repository.stargazers.totalCount}
      {repository.viewerHasStarred ? ' Unstar' : ' Star'}
    </button>
    <ul>
      {repository.issues.edges.map(issue => (
        <li key={issue.node.id}>
          <a href={issue.node.url}>{issue.node.title}</a>
          <ul>
            {issue.node.reactions.edges.map(reaction => (
              <li key={reaction.node.id}>{reaction.node.content}</li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
    <hr />
    {repository.issues.pageInfo.hasNextPage && (
      <button onClick={onFetchMoreIssues}>More</button>
    )}
  </div>
);

export default App;
