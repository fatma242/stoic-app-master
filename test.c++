#include <vector>
#include <numeric>
#include <algorithm>
#include <iostream>
using namespace std;

using namespace std;

vector<bool> solution(vector<int> allowances, int extraAllowances)
{
    int n = allowances.size();
    vector<bool> result(n, false);

    // Find the maximum allowance before distribution
    int maxOriginal = 0;
    for (int allowance : allowances)
    {
        maxOriginal = max(maxOriginal, allowance);
    }

    // Each child gets the full extraAllowances amount
    for (int i = 0; i < n; i++)
    {
        int finalAmount = allowances[i] + extraAllowances;

        // Check if final amount is at least the original maximum
        if (finalAmount >= maxOriginal)
        {
            result[i] = true;
        }
    }

    return result;
}
int main()
{
    // Example usage
    vector<int> allowances = {10, 20, 10, 20, 50};
    int extraAllowances = 20;
    vector<bool> result = solution(allowances, extraAllowances);

    // Output the result
    for (bool canReach : result)
    {
        cout << (canReach ? "true" : "false") << " ";
    }
    return 0;
}