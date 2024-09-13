//==============================================================================
// Epilog
//==============================================================================
// Copyright (c) 2020 The Board of Trustees of the Leland Stanford Junior
// University.  All nonprofit research institutions may use this Software for
// any non-profit purpose, including sponsored research and collaboration.  All
// nonprofit research institutions may publish any information included in the
// Software.  This Software may not be redistributed.  It may not be used for
// commercial purposes.  For any questions regarding commercial use or
// redistribution, please contact the Office of Technology Licensing at Stanford
// University (info@otlmail.stanford.edu).
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS";
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
//==============================================================================
// Sentential Representation
//==============================================================================

function symbolp (x)
 {return typeof x==='string'}

function varp (x)
 {return (typeof(x)==='string' && x.length!==0 &&
          (x.charCodeAt(0)===95 || x[0]!==x[0].toLowerCase()))}

function constantp (x)
 {return typeof x==='string' && x.length!==0 && x[0]===x[0].toLowerCase()}

function numberp (x)
 {return !isNaN(Number(x))} 

function stringp (x)
 {return typeof x==='string' && x.length>1 && x[0]==='"' &&  x[x.length-1]==='"'}

var counter = 0

function newvar ()
 {counter++;  return 'V' + counter}

function newsym ()
 {counter++;  return 'c' + counter}

function seq ()
 {var exp=new Array(arguments.length);
  for (var i=0; i<arguments.length; i++) {exp[i]=arguments[i]};
  return exp}

function arg0 (p)
 {return p[0]}

function arg1 (p)
 {return p[1]}

function arg2 (p)
 {return p[2]}

function head (p)
 {return p[0]}

function tail (l)
 {return l.slice(1,l.length)}

function makeequality (x,y)
 {return seq('same',x,y)}

function makeinequality (x,y)
 {return seq('distinct',x,y)}

function makenegation (p)
 {return seq('not',p)}

function makeconjunction (p,q)
 {return seq('and',p,q)}

function makedisjunction (p,q)
 {return seq('or',p,q)}

function makereduction (head,body)
 {return seq('reduction',head,body)}

function makeimplication (head,body)
 {return seq('implication',head,body)}

function makeimplication (head,body)
 {if (head.length===0) {return body};
  if (head[0]==='and')
     {return seq('implication').concat(tail(head)).concat(seq(body))};
  return seq('implication',head,body)}

function makeequivalence (head,body)
 {return seq('equivalence',head,body)}

function makedefinition (head,body)
 {return seq('definition',head,body)}

function makerule (head,body)
 {if (body.length===0) {return head};
  if (body[0]==='and') {return seq('rule',head).concat(tail(body))};
  return seq('rule',head,body)}

function maketransition (head,body)
 {return seq('transition',head,body)}

function makeuniversal (variable,scope)
 {return seq('forall',variable,scope)}

function makeexistential (variable,scope)
 {return seq('exists',variable,scope)}

function makeconditional (p,x,y)
 {return seq('if',p,x,y)}

function makeclause (p,q)
 {return seq('clause',p,q)}

function makedefinition (head,body)
 {if (!symbolp(body) & body[0]=='and')
     {return seq('definition',head).concat(tail(body))}
  else {return seq('definition',head,body)}}

function makestep (sentence,justification,p1,p2)
 {var exp = new Array(3);
  exp[0] = 'step';
  exp[1] = sentence;
  exp[2] = justification;
  if (p1) {exp[3] = p1};
  if (p2) {exp[4] = p2};
  return exp}

function makeproof ()
 {var exp = new Array(1);
  exp[0] = 'proof';
  return exp}

function maksatom (r,s)
 {return seq(r).concat(s)}

function maksand (s)
 {if (s.length===0) {return 'true'};
  if (s.length===1) {return s[0]};
  return seq('and').concat(s)}

function maksor (s)
 {if (s.length===0) {return 'false'};
  if (s.length===1) {return s[0]};
  return seq('or').concat(s)}

function negate (p)
 {if (symbolp(p)) {return makenegation(p)};
  if (p[0]==='not') {return p[1]};
  return makenegation(p)}

function adjoin (x,s)
 {if (!findq(x,s)) {s.push(x)};
  return s}

function adjoinit (x,s)
 {if (find(x,s)) {return s} else {s.push(x); return s}}

function newadjoin (x,s)
 {if (!findq(x,s)) {return s.concat(seq(x))};
  return s}

function unjoin (x,s)
 {for (var i=0; i<s.length; i++)
      {if (s[i]===x) {s.splice(i,1); return s}};
  return s}

function concatenate (l1,l2)
 {return l1.concat(l2)}

function nconc (l1,l2)
 {for (var i=0; i<l2.length; i++) {l1.push(l2[i])};
  return l1}

function findq (x,s)
 {for (var i=0; i<s.length; i++) {if (x===s[i]) {return true}};
  return false}

function find (x,s)
 {for (var i=0; i<s.length; i++) {if (equalp(x,s[i])) {return true}};
  return false}

function findp (x,s)
 {for (var i=0; i<s.length; i++) {if (equalp(x,s[i])) {return true}};
  return false}

function subset (s1,s2)
 {for (var i=0; i<s1.length; i++)
      {if (!find(s1[i],s2)) {return false}};
  return true}

function difference (l1, l2)
 {var answer = seq();
  for (var i=0; i<l1.length; i++)
      {if (!find(l1[i],l2)) {answer[answer.length] = l1[i]}};
  return answer}

function subst (x,y,z)
 {if (z===y) {return x};
  if (symbolp(z)) {return z};
  var exp = new Array(z.length);
  for (var i=0; i<z.length; i++)
      {exp[i] = subst(x,y,z[i])};
  return exp}

function substitute (p,q,r)
 {if (symbolp(r)) {if (r===p) {return q} else {return r}};
  var exp = seq();
  for (var i=0; i<r.length; i++)
      {exp[exp.length] = substitute(p,q,r[i])};
  if (equalp(exp,p)) {return q} else {return exp}}

function substitutions (p,q,r)
 {if (symbolp(r)) {if (r===p) {return seq(r,q)} else {return seq(r)}};
  return substitutionsexp(p,q,r,0)}

function substitutionsexp (p,q,r,n)
 {if (n===r.length) {return seq(seq())};
  var firsts = substitutions(p,q,r[n]);
  var rests = substitutionsexp(p,q,r,n+1);
  var results = seq();  for (var i=0; i<firsts.length; i++)
      {for (var j=0; j<rests.length; j++)
           {exp = seq(firsts[i]).concat(rests[j]);
            results[results.length] = exp;
            if (equalp(exp,p)) {results[results.length] = q}}}
  return results}

function vars (x)
 {return varsexp(x,seq())}

function varsexp (x,vs)
 {if (varp(x)) {return adjoin(x,vs)};
  if (symbolp(x)) {return vs};
  for (var i=0; i<x.length; i++) {vs = varsexp(x[i],vs)};
  return vs}

function freevarsexp (x,al,vs)
 {if (varp(x)) {if (al[x]==null || al[x].length===0) {return adjoin(x,vs)}};
  if (symbolp(x)) {return vs};
  for (var i=0; i<x.length; i++) {vs = freevarsexp(x[i],al,vs)};
  return vs}

function constants (x)
 {return constantsexp(x,seq())}

function constantsexp (x,vs)
 {if (varp(x)) {return vs};
  if (symbolp(x)) {return adjoin(x,vs)};
  for (var i=1; i<x.length; i++) {vs = constantsexp(x[i],vs)};
  return vs}

function equalp (p,q)
 {if (typeof(p)==='string' || typeof(q)==='string') {return p===q};
  if (p.length!==q.length) {return false};
  for (var i=0; i<p.length; i++) {if (!equalp(p[i],q[i])) {return false}};
  return true}

function pseudogroundp (exp,al)
 {if (varp(exp))
     {var dum = al[exp];
      if (dum && dum.length > 0) {return pseudogroundp(dum[0],dum[1])};
      return false};
  if (symbolp(exp)) {return true};
  for (var i=0; i<exp.length; i++)
      {if (!pseudogroundp(exp[i],al)) {return false}};
  return true}

//==============================================================================
// Linked Lists
//==============================================================================

var nil = 'nil'

function nullp (l)
 {return l==='nil'}

function cons (x,y)
 {return {car:x,cdr:y}}

function car (l)
 {return l.car}

function cdr (l)
 {return l.cdr}

function rplaca(l,x)
 {l.car = x; return l}

function rplacd(l,m)
 {l.cdr = m; return l}

function list ()
 {var exp=nil;
  for (var i=arguments.length; i>0; i--)
      {exp=cons(arguments[i-1],exp)};
  return exp}

function len (l)
 {var n = 0;
  for (var m=l; m!==nil; m = cdr(m)) {n = n+1};
  return n}

function memberp (x,l)
 {if (nullp(l)) {return false};
  if (equalp(car(l),x)) {return true};
  if (memberp(x,cdr(l))) {return true};
  return false}

function amongp (x,y)
 {if (symbolp(y)) {return x==y};
  for (var i=0; i<y.length; i++) {if (amongp(x,y[i])) {return true}}
  return false}

function nreverse (l)
 {if (nullp(l)) {return nil}
  else {return nreversexp(l,nil)}}

function nreversexp (l,ptr)
 {if (cdr(l)===nil) {rplacd(l,ptr); return l};
  var rev = nreversexp(cdr(l),l);
  rplacd(l,ptr);;
  return rev}

function acons (x,y,al)
 {return cons(cons(x,y),al)}

function assoc (x,al)
 {if (nullp(al)) {return false};
  if (x===car(car(al))) {return car(al)};
  return assoc(x,cdr(al))}

//==============================================================================
// Matching and Unification
//==============================================================================
//------------------------------------------------------------------------------
// matcher
// unifier
// plug
// standardize
//------------------------------------------------------------------------------

function matcher (x,y)
 {return match(x,y,nil)}

function match (x,y,bl)
 {if (varp(x)) {return matchvar(x,y,bl)};
  if (symbolp(x)) {if (x===y) {return bl} else {return false}};
  return matchexp(x,y,bl)}

function matchvar (x,y,bl)
 {var dum = assoc(x,bl);
  if (dum!==false) {if (equalp(cdr(dum),y)) {return bl} else {return false}};
  return acons(x,y,bl)}

function matchexp(x,y,bl)
 {if (symbolp(y)) {return false};
  var m = x.length;
  var n = y.length;  
  if (m!==n) {return false};
  for (var i=0; i<m; i++)
      {bl = match(x[i],y[i],bl);
       if (bl===false) {return false}};
  return bl}

//------------------------------------------------------------------------------

function unifier (x,y)
 {return unify(x,y,nil)}

function unify (x,y,bl)
 {if (x===y) {return bl};
  if (varp(x)) {return unifyvar(x,y,bl)};
  if (symbolp(x)) {return unifyatom(x,y,bl)};
  return unifyexp(x,y,bl)}

function unifyvar (x,y,bl)
 {var dum = assoc(x,bl);
  if (dum!==false) {return unify(cdr(dum),y,bl)};
  if (occurs(x,y,bl)) {return false};
  return acons(x,y,bl)}

function occurs (x,y,al)
 {if (varp(y))
     {if (x===y) {return true};
      var dum = assoc(y,al);
      if (dum!==false) {return occurs(x,cdr(dum),al)};
      return false};
  if (symbolp(y)) {return false};
  for (var i=0; i<y.length; i++)
      {if (occurs(x,y[i],al)) {return true}};
  return false}

function unifyatom (x,y,bl)
 {if (varp(y)) {return unifyvar(y,x,bl)};
  return false}

function unifyexp(x,y,bl)
 {if (varp(y)) {return unifyvar(y,x,bl)}
  if (symbolp(y)) {return false};
  if (x.length!==y.length) {return false};
  for (var i=0; i<x.length; i++)
      {bl = unify(x[i],y[i],bl);
       if (bl===false) {return false}};
  return bl}

//------------------------------------------------------------------------------

function plug (x,bl)
 {if (varp(x)) {return plugvar(x,bl)};
  if (symbolp(x)) {return x};
  return plugexp(x,bl)}

function plugvar (x,bl)
 {var dum = assoc(x,bl);
  if (dum===false) {return x};
  return plug(cdr(dum),bl)}

function plugexp (x,bl)
 {var exp = new Array(x.length);
  for (var i=0; i<x.length; i++)
      {exp[i] = plug(x[i],bl)};
  return exp}

//------------------------------------------------------------------------------

var alist;

function standardize (x)
 {alist = nil;
  return standardizeit(x)}

function standardizeit (x)
 {if (varp(x)) {return standardizevar(x)};
  if (symbolp(x)) {return x};
  return standardizeexp(x)}

function standardizevar (x)
 {var dum = assoc(x,alist);
  if (dum!==false) {return cdr(dum)};
  var rep = newvar();
  alist = acons(x,rep,alist);
  return rep}

function standardizeexp (x)
 {var exp = new Array(x.length);
  for (var i=0; i<x.length; i++)
      {exp[i] = standardizeit(x[i])};
  return exp}

//------------------------------------------------------------------------------
// maatcher
// vnifier
// pluug
//------------------------------------------------------------------------------

function maatcher (x,y)
 {return maatchify(x,seq(),y,seq(),seq())}

function maatchifyp (x,al,y,bl,ol)
 {if (maatchify(x,al,y,bl,ol)) {return true};
  backup(ol);
  return false}

function maatchify (x,al,y,bl,ol)
 {if (varp(x)) {return maatchvar(x,al,y,bl,ol)};
  if (symbolp(x)) {return (x===y)};
  return maatchexp(x,al,y,bl,ol)}

function maatchvar (x,al,y,bl,ol)
 {var dum = al[x];
  if (dum && dum.length > 0) {return maatchify(dum[0],dum[1],y,bl,ol)};
  ol.push(setbdg(x,al,y,bl));
  return true}

function maatchexp(x,al,y,bl,ol)
 {if (symbolp(y)) {return false};
  var m = x.length;
  var n = y.length;  
  if (m!==n) {return false};
  for (var i=0; i<m; i++)
      {if (!maatchify(x[i],al,y[i],bl,ol)) {return false}};
  return true}

//------------------------------------------------------------------------------

var occurcheck = false

function vnifier (x,y)
 {var ol = seq();
  if (vnify(x,seq(),y,seq(),ol)) {return ol};
  backup(ol);
  return false}

function vnifyp (x,al,y,bl,ol)
 {if (vnify(x,al,y,bl,ol)) {return true};
  backup(ol);
  return false}

function vnify (x,al,y,bl,ol)
 {if (varp(x)) {return vnifyvar(x,al,y,bl,ol)};
  if (symbolp(x)) {return vnifysymbol(x,al,y,bl,ol)};
  return vnifyexp(x,al,y,bl,ol)}

function vnifyvar (x,al,y,bl,ol)
 {if (x===y && al===bl) {return true};
  var dum = al[x];
  if (dum && dum.length > 0) {return vnify(dum[0],dum[1],y,bl,ol)};
  if (vident(x,al,y,bl)) {return true};
  if (occurcheck && vccurs(x,al,y,bl)) {return false};
  ol.push(setbdg(x,al,y,bl));
  return true}

function vident (x,al,y,bl)
 {if (x===y && al===bl) {return true};
  if (varp(y))
     {var dum = bl[y];
      if (dum && dum.length > 0) {return vident(x,al,dum[0],dum[1])}};
  return false}

function vccurs (x,al,y,bl)
 {if (varp(y))
     {if (x===y && al===bl) {return true};
      var dum = bl[y];
      if (dum && dum.length > 0) {return vccurs(x,al,dum[0],dum[1])};
      return false};
  if (symbolp(y)) {return false};
  for (var i=0; i<y.length; i++)
      {if (vccurs(x,al,y[i],bl)) {return true}};
  return false}

function vnifysymbol (x,al,y,bl,ol)
 {if (x===y) {return true};
  if (varp(y)) {return vnifyvar(y,bl,x,al,ol)};
  return false}

function vnifyexp(x,al,y,bl,ol)
 {if (varp(y)) {return vnifyvar(y,bl,x,al,ol)}
  if (symbolp(y)) {return false};
  if (x.length!==y.length) {return false};
  for (var i=0; i<x.length; i++)
      {if (!vnify(x[i],al,y[i],bl,ol)) {return false}};
  return true}

//------------------------------------------------------------------------------

function getbdg (x,al)
 {return al[x]}

function setbdg (x,al,y,bl)
 {var bdg = seq(y,bl);
  al[x] = bdg;
  return bdg}

function backup (bl)
 {for (var i=0; i<bl.length; i++) {bl[i].length = 0}}

function pluug (x,al,bl)
 {if (varp(x)) {return pluugvar(x,al,bl)};
  if (symbolp(x)) {return x};
  //if (x[0]==='setofall') {return pluugquantifier(x,al,bl)};
  //if (x[0]==='countofall') {return pluugquantifier(x,al,bl)};
  return pluugexp(x,al,bl)}

function pluugvar (x,al,bl)
 {var dum = al[x];
  if (dum && dum.length > 0) {return pluug(dum[0],dum[1],bl)};
  if (al===bl) {return x};
  var rep = newvar();
  al[x] = seq(rep,bl);
  return rep};

function pluugquantifier (x,al,bl)
 {var result = seq('setofall',x[1]);
  for (var i=2; i<x.length; i++)
      {result.push(pluug(x[i],al,bl))};
  return result}

function pluugexp (x,al,bl)
 {var exp = new Array(x.length);
  for (var i=0; i<x.length; i++)
      {exp[i] = pluug(x[i],al,bl)};
  return exp}

//==============================================================================
// Deduplication
//==============================================================================

function uniquify (ins)
 {var outs = seq();
  for (var i=0; i<ins.length; i++) {outs = adjoinit(ins[i],outs)};
  return outs}

function vniquify (ol)
 {var sl = ol.sort();
  var nl =seq();
  var last = false;
  for (var i=0; i<sl.length; i++)
      {if (!equalp(sl[i],last)) {last = sl[i]; nl[nl.length] = last}};
  return nl}

function wniquify (original)
 {var pairlist = [];
  var base = 1000000000;
  for (var i=0; i<original.length; i++)
      {pairlist[i] = [original[i],base+i]};
  pairlist = pairlist.sort();
  var newlist = [];
  for (var i=pairlist.length-1; i>0; i--)
      {if (equalp(pairlist[i-1][0],pairlist[i][0])) {continue};
       newlist.push(pairlist[i])};
  newlist.push(pairlist[0]);
  newlist = newlist.sort(function(x,y){return x[1]-y[1]});
  return newlist.map(first)}

function first (x)
 {return x[0]}

function zniquify (original)
 {if (original.length<=10) {return uniquify(original)};
  if (original.length<=1000000000) {return wniquify(original)};
  return original}

//==============================================================================
// Indexes
//==============================================================================

var indexing = true
var dataindexing = true
var ruleindexing = true

//------------------------------------------------------------------------------
// simple lists
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// addcontent, remcontent
//------------------------------------------------------------------------------

function addcontent (p,theory)
 {theory.push(p);
  return p}

function remcontent (p,theory)
 {for (var i=0; i<theory.length; i++)
      {if (theory[i]===p) {theory.splice(i,1); return p}};
  return false}

//------------------------------------------------------------------------------
// restricted indexes (no numbers or map)
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// index, flatindex, fullindex, ruleindex
// unindex, flatunindex, fullunindex, ruleunindex
// indexps, flatindexps, fullindexps, fullvndexps, ruleunindexps
//------------------------------------------------------------------------------

function index (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return indexsymbol(x,p,theory)};
  return indexsymbol(x[0],p,theory)}

function flatindex (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return indexsymbol(x,p,theory)};
  for (var i=0; i<x.length; i++)
      {if (symbolp(x[i]) && !varp(x[i]))
          {indexsymbol(x,p,theory)}};
  return p}

function fullindex (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return indexsymbol(x,p,theory)};
  for (var i=0; i<x.length; i++) {fullindex(x[i],p,theory)};
  return p}

function ruleindex (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return indexsymbol(x,p,theory)};
  if (x[0]==='rule') {return ruleindex(x[1],p,theory)};
  if (x[0]==='handler') {return ruleindex(x[1],p,theory)};
  if (x[0]==='definition') {return ruleindex(x[1],p,theory)};
  return ruleindex(x[0],p,theory)}

function indexsymbol (x,p,theory)
 {if (x==='map') {return p};
  if (!isNaN(Number(x))) {return p};
  var data = theory[x];
  if (data===undefined) {theory[x] = [p]; return p};
  if (data[data.length-1]===p) {return p};
  data.push(p);
  return p}

//------------------------------------------------------------------------------

function unindex (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return unindexsymbol(x,p,theory)};
  return unindexsymbol(x[0],p,theory)}

function flatunindex (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return unindexsymbol(x,p,theory)};
  for (var i=0; i<x.length; i++)
      {if (symbolp(x[i]) && !varp(x[i]))
          {unindexsymbol(x,p,theory)}};
  return p}

function fullunindex (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return unindexsymbol(x,p,theory)};
  for (var i=0; i<x.length; i++) {fullunindex(x[i],p,theory)};
  return p}

function ruleunindex (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return unindexsymbol(x,p,theory)};
  if (x[0]==='rule') {return ruleunindex(x[1],p,theory)};
  return ruleunindex(x[0],p,theory)}

function unindexsymbol (x,p,theory)
 {if (theory[x]) {return remcontent(p,theory[x])}}

//------------------------------------------------------------------------------

function flatindexps (p,theory)
 {if (varp(p)) {return theory};
  if (symbolp(p)) {return indexees(p,theory)};
  var best = indexees(p[0],theory);
  for (var i=1; i<p.length; i++)
      {if (symbolp(p[i]) && !varp(p[i]))
          {var dum = indexees(p[i],theory);
           if (dum.length<best.length) {best = dum}}};
  return best}

function fullindexps (p,theory)
 {if (varp(p)) {return theory};
  if (symbolp(p)) {return indexees(p,theory)};
  var best = indexees(p[0],theory);
  for (var i=1; i<p.length; i++)
      {var dum = fullindexps(p[i],theory);
       if (dum.length<best.length) {best = dum}};
  return best}

function fullvndexps (p,al,facts)
 {if (varp(p))
     {var dum = al[p];
      if (dum && dum.length>0) {return fullvndexps(dum[0],dum[1],facts)};
      return facts};
  if (symbolp(p)) {return indexees(p,facts)};
  var best = indexees(p[0],facts);
  for (var i=1; i<p.length; i++)
      {var dum = fullvndexps(p[i],al,facts);
       if (dum.length<best.length) {best = dum}};
  return best}

function ruleindexps (p,theory)
 {if (varp(p)) {return theory};
  if (symbolp(p)) {return indexees(p,theory)};
  if (p[0]==='rule') {return ruleindexps(p[1],theory)};
  if (p[0]==='handler') {return ruleindexps(p[1],theory)};
  if (p[0]==='definition') {return ruleindexps(p[1],theory)};
  return indexees(p[0],theory)}

function indexees (x,theory)
 {if (x==='map') {return theory};
  if (!isNaN(Number(x))) {return theory};
  var data = theory[x];
  if (data) {return data} else {return []}}

//------------------------------------------------------------------------------
// unrestricted indexes (indexes on everything except variables)
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
// defineindex
// baseindex
// baseunindex
// baseanswerx, baseanswers, baseindexps, basevndexps, baseindexees
//------------------------------------------------------------------------------

function defineindex (data)
 {var ds = {};
  for (var i=0; i<data.length; i++)
      {baseindex(data[i],data[i],ds)};
  return ds}

//------------------------------------------------------------------------------

function baseindex (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return baseindexsymbol(x,p,theory)};
  for (var i=0; i<x.length; i++) {baseindex(x[i],p,theory)};
  return p}

function baseindexsymbol (x,p,theory)
 {var data = theory[x];
  if (data===undefined) {theory[x] = [p]; return p};
  if (data[data.length-1]===p) {return p};
  data.push(p);
  return p}

//------------------------------------------------------------------------------

function baseunindex (x,p,theory)
 {if (varp(x)) {return p};
  if (symbolp(x)) {return baseunindexsymbol(x,p,theory)};
  for (var i=0; i<x.length; i++) {baseunindex(x[i],p,theory)};
  return p}

function baseunindexsymbol (x,p,theory)
 {if (theory[x]) {return remcontent(p,theory[x])}}

//------------------------------------------------------------------------------

function baseindexps (p,theory)
 {if (varp(p)) {return theory};
  if (symbolp(p)) {return baseindexees(p,theory)};
  var best = baseindexees(p[0],theory);
  for (var i=1; i<p.length; i++)
      {var dum = baseindexps(p[i],theory);
       if (dum.length<best.length) {best = dum}};
  return best}

function basevndexps (p,al,theory)
 {if (varp(p))
     {var dum = al[p];
      if (dum && dum.length>0) {return basevndexps(dum[0],dum[1],theory)};
      return false};
  if (symbolp(p)) {return baseindexees(p,theory)};
  var best = baseindexees(p[0],theory);
  for (var i=1; i<p.length; i++)
      {var dum = basevndexps(p[i],al,theory);
       if (dum && dum.length<best.length) {best = dum}};
  return best}

function baseindexees (x,theory)
 {var data = theory[x];
  if (data) {return data} else {return []}}

//==============================================================================
// Theories
//==============================================================================
//------------------------------------------------------------------------------
// definetheory, definefacts, definerules
// definemore, definemorefacts, definemorerules
// emptytheory
//------------------------------------------------------------------------------

function definetheory (source,data)
 {emptytheory(source);
  definemore(source,data);
  return true}

function definefacts (source,data)
 {emptytheory(source);
  definemorefacts(source,data);
  return true}

function definerules (source,data)
 {emptytheory(source);
  definemorerules(source,data);
  return true}

function definemore (theory,data)
 {for (var i=0; i<data.length; i++) {insert(data[i],theory)};
  return true}

function definemorefacts (theory,data)
 {for (var i=0; i<data.length; i++) {insertfact(data[i],theory)};
  return theory}

function definemorerules (theory,data)
 {for (var i=0; i<data.length; i++) {insertrule(data[i],theory)};
  return theory}

function emptytheory (theory)
 {theory.splice(0,theory.length);
  for (var x in theory) {delete theory[x]};
  return true}

//------------------------------------------------------------------------------
// save, savefact, saverule
// drop, dropfact, droprule
// eliminate, eliminatefacts, eliminaterules
//------------------------------------------------------------------------------

function save (datum,theory)
 {var data = lookups(datum,theory);
  if (find(datum,data)) {return false};
  return insert(datum,theory)}

function savefact (datum,theory)
 {var data = lookupfacts(datum,theory);
  if (find(datum,data)) {return false};
  return insertfact(datum,theory)}

function saverule (datum,theory)
 {var data = lookuprules(datum,theory);
  if (find(datum,data)) {return false};
  return insertrule(datum,theory)}

function drop (p,theory)
 {var data = lookups(p,theory);
  for (var i=0; i<data.length; i++)
      {var datum = data[i];
       if (equalp(datum,p)) {uninsert(datum,theory); return datum}};
  return false}

function dropfact (p,theory)
 {var data = lookupfacts(p,theory);
  for (var i=0; i<data.length; i++)
      {var datum = data[i];
       if (equalp(datum,p)) {uninsertfact(datum,theory); return datum}};
  return false}

function droprule (p,theory)
 {var data = lookuprules(p,theory);
  for (var i=0; i<data.length; i++)
      {var datum = data[i];
       if (equalp(datum,p)) {uninsertrule(datum,theory); return datum}};
  return false}

function eliminate (object,theory)
 {var data = indexees(object,theory).concat();
  for (var i=0; i<data.length; i++)
      {if (data[i][1]===object) {uninsert(data[i],theory)}};
  return object}

function eliminatefacts (object,theory)
 {var data = indexees(object,theory).concat();
  for (var i=0; i<data.length; i++)
      {if (data[i][1]===object) {uninsertfact(data[i],theory)}};
  return object}

function eliminaterules (object,theory)
 {var data = indexees(object,theory).concat();
  for (var i=0; i<data.length; i++)
      {if (data[i][1]===object) {uninsertrule(data[i],theory)}};
  return object}

//------------------------------------------------------------------------------
// insert, uninsert
//------------------------------------------------------------------------------

function insert (p,theory)
 {addcontent(p,theory);
  if (indexing) {index(p,p,theory)};
  return p}

function insertfact (p,theory)
 {addcontent(p,theory);
  if (dataindexing) {fullindex(p,p,theory)};
  return p}

function insertrule (p,theory)
 {addcontent(p,theory);
  if (ruleindexing) {ruleindex(p,p,theory)};
  return p}

//------------------------------------------------------------------------------

function uninsert (p,theory)
 {if (indexing) {unindex(p,p,theory)};
  return remcontent(p,theory)}

function uninsertfact (p,theory)
 {if (dataindexing) {fullunindex(p,p,theory)};
  return remcontent(p,theory)}

function uninsertrule (p,theory)
 {if (ruleindexing) {ruleunindex(p,p,theory)};
  return remcontent(p,theory)}

//------------------------------------------------------------------------------

function indexps (p,theory)
 {if (indexing) {return ruleindexps(p,theory)} else {return theory}}

function factindexps (p,theory)
 {if (dataindexing) {return fullindexps(p,theory)} else {return theory}}

function envvndexps (p,al,theory)
 {if (dataindexing) {return fullvndexps(p,al,theory)} else {return theory}}

function viewindexps (p,theory)
 {if (ruleindexing) {return ruleindexps(p,theory)} else {return theory}}

//------------------------------------------------------------------------------

function lookups (p,theory)
 {if (indexing) {return ruleindexps(p,theory)} else {return theory}}

function lookupfacts (p,theory)
 {if (dataindexing) {return fullindexps(p,theory)} else {return theory}}

function envlookupfacts (p,al,theory)
 {if (dataindexing) {return fullvndexps(p,al,theory)} else {return theory}}

function lookuprules (p,theory)
 {if (ruleindexing) {return ruleindexps(p,theory)} else {return theory}}

//------------------------------------------------------------------------------
// miscellaneous
//------------------------------------------------------------------------------

function basep (r,rules)
 {return !viewp(r,rules)}

function viewp (r,rules)
 {if (ruleindexing) {return (indexees(r,rules).length!==0)};
  for (var i=0; i<rules.length; i++)
      {if (operator(rules[i])===r) {return true}};
  return false}

function getbases (data)
 {var tables = seq();
  for (var i=0; i<data.length; i++)
      {tables = adjoin(operator(data[i]),tables)};
  return tables}

function getviews (data)
 {var tables = seq();
  for (var i=0; i<data.length; i++)
      {if (symbolp(data[i])) {tables = adjoin(operator(data[i]),tables)};
       if (data[i][0]==='handler') {continue};
       tables = adjoin(operator(data[i]),tables)};
  return tables}

function makepattern (relation,arity)
 {var pattern = seq(relation);
  for (var j=1; j<=arity; j++)
      {pattern[j] = 'X' + j};
  return pattern}

function getfactarity (relation,facts)
 {for (var i=0; i<facts.length; i++)
      {if (facts[i][0]===relation) {return facts[i].length-1}};
  return 0}

function getrulearity (relation,rules)
 {for (var i=0; i<rules.length; i++)
      {if (rules[i]===relation) {return 0};
       if (symbolp(rules[i])) {continue};
       if (rules[i][0]===relation) {return rules[i].length-1};
       if (rules[i][0]==='rule' && !symbolp(rules[i][1]) && rules[i][1][0]===relation)
          {return rules[i][1].length-1}};
  return 0}

//------------------------------------------------------------------------------

function sentences (relation,data)
 {var results = seq();
  for (var i=0; i<data.length; i++)
      {if (operator(data[i])===relation) {results.push(data[i])}};
  return results}

function sentencen (m,n,relation,data)
 {var results = sentences(relation,data);
  if (results.length>=n) {return results.slice(m,n)};
  if (results.length>=m) {return results.slice(m)};
  return seq()}

function viewfacts (relation,facts,rules)
 {var pattern = makepattern(relation,getrulearity(relation,rules));
  return sortfinds(pattern,pattern,facts,rules)}

//==============================================================================
// Accessing datasets without inference
// base always indexed
// data depends on dataindexing
//==============================================================================

function baseanswerx (query,al,facts,rules)
 {var data = basevndexps(query,al,facts);
  var answers = [];
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (maatchifyp(query,al,data[i],bl,ol))
          {backup(ol); return data[i]}};
  return false}

function baseanswers (query,al,facts,rules)
 {var data = basevndexps(query,al,facts);
  var answers = [];
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (maatchifyp(query,al,data[i],bl,ol))
          {answers.push(data[i]);
           backup(ol)}};
  return answers}

//------------------------------------------------------------------------------

function dataanswerx (query,al,facts,rules)
 {var data = dataindexing ? fullvndexps(query,al,facts) : facts;
  var answers = [];
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (maatchifyp(query,al,data[i],bl,ol))
          {backup(ol); return data[i]}};
  return false}

function dataanswers (query,al,facts,rules)
 {var data = dataindexing ? fullvndexps(query,al,facts) : facts;
  var answers = [];
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (maatchifyp(query,al,data[i],bl,ol))
          {answers.push(data[i]);
           backup(ol)}};
  return answers}

//------------------------------------------------------------------------------

function companswerx (query,al,facts,rules)
 {var arg = pluug(query[1],al,al);
  var val = compvalue(arg,facts,rules);
  var ol = seq();
  if (maatchify(query[2],al,val,al,ol))
     {var answer = ['evaluate',arg,val];
      backup(ol);
      return answer};
  return false}

function companswers (query,al,facts,rules)
 {var arg = pluug(query[1],al,al);
  var val = compvalue(arg,facts,rules);
  var ol = seq();
  if (maatchify(query[2],al,val,al,ol))
     {var answer = ['evaluate',arg,val];
      backup(ol);
      return [answer]};
  return false}

//==============================================================================
// Inference without built-in relations
//==============================================================================
//------------------------------------------------------------------------------
// basefindp
// basefindx
// basefinds
// basefindn
// basefindg
// basevalue
//------------------------------------------------------------------------------

var inferences = 0;
var instantiations = 0;

function basefindp (query,facts,rules)
 {return (basefindx('true',query,facts,rules)==='true')}

function basefindx (result,query,facts,rules)
 {var answers = basefindn(1,result,query,facts,rules);
  if (answers.length>0) {return answers[0]};
  return false}

function basefinds (result,query,facts,rules)
 {return zniquify(basefindn(true,result,query,facts,rules))}

function basefindn (n,result,query,facts,rules)
 {var results = [];
  if (n<=0) {return results};
  basesome(n,result,query,seq(),{},nil,results,facts,rules);
  return results}

function basefindg (result,query,facts,rules)
 {return compgen(result,query,facts,rules)}

//------------------------------------------------------------------------------

function basesome (n,x,p,pl,al,cont,results,facts,rules)
 {inferences = inferences + 1;
  if (symbolp(p))
     {return basesomeatom(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='same')
     {return basesomesame(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='distinct')
     {return basesomedistinct(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='not')
     {return basesomenot(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='and')
     {return basesomeand(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='or')
     {return basesomeor(n,x,p,pl,al,cont,results,facts,rules)};
  if (basep(p[0],rules))
     {return basesomebase(n,x,p,pl,al,cont,results,facts,rules)};
  return basesomeview(n,x,p,pl,al,cont,results,facts,rules)}

function basesomeatom (n,x,p,pl,al,cont,results,facts,rules)
 {if (p==='true') {return basesomeexit(n,x,pl,al,cont,results,facts,rules)};
  if (p==='false') {return false};
  if (basep(p,rules))
     {return basesomebase(n,x,p,pl,al,cont,results,facts,rules)};
  return basesomeground(n,x,p,pl,al,cont,results,facts,rules)}

function basesomesame (n,x,p,pl,al,cont,results,facts,rules)
 {var ol = seq();
  if (vnifyp(p[1],al,p[2],al,ol))
     {var answer = basesomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  return false}

function basesomedistinct (n,x,p,pl,al,cont,results,facts,rules)
 {var ol = seq();
  if (vnifyp(p[1],al,p[2],al,ol)) {backup(ol); return false};
  return basesomeexit(n,x,pl,al,cont,results,facts,rules)}

function basesomenot (n,x,p,pl,al,cont,results,facts,rules)
 {if (basesome(1,x,p[1],seq(),al,nil,[],facts,rules)===false)
     {return basesomeexit(n,x,pl,al,cont,results,facts,rules)};
  return false}

function basesomeand (n,x,p,pl,al,cont,results,facts,rules)
 {return basesomeexit(n,x,concatenate(tail(p),pl),al,cont,results,facts,rules)}

function basesomeor (n,x,p,pl,al,cont,results,facts,rules)
 {var answer;
  for (var i=1; i<p.length; i++)
      {if (answer = basesome(n,x,p[i],pl,al,cont,results,facts,rules))
          {return answer}};
  return false}

function basesomebase (n,x,p,pl,al,cont,results,facts,rules)
 {var data = envlookupfacts(p,al,facts);
  for (var i=0; i<data.length; i++)
      {instantiations++;
       var bl = {};
       var ol = seq();
       if (vnifyp(data[i],bl,p,al,ol))
          {var answer = basesomeexit(n,x,pl,al,cont,results,facts,rules);
           backup(ol);
           if (answer) {return answer}}};
  return false}

function basesomeground (n,x,p,pl,al,cont,results,facts,rules)
 {if (basesomeview(1,x,p,seq(),al,nil,[],facts,rules))
     {return basesomeexit(n,x,pl,al,cont,results,facts,rules)};
  return false}

function basesomeview (n,x,p,pl,al,cont,results,facts,rules)
 {var data = lookuprules(p,rules);
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (data[i][0]==='rule')
          {if (vnifyp(data[i][1],bl,p,al,ol))
              {var ql = data[i].slice(2);
               var nc = seq(pl,al,cont);
               var answer = basesomeexit(n,x,ql,bl,nc,results,facts,rules);
               backup(ol);
               if (answer) {return answer}}}
       else {if (vnifyp(data[i],bl,p,al,ol))
                {var answer = basesomeexit(n,x,pl,al,cont,results,facts,rules);
                 backup(ol);
                 if (answer) {return answer}}}}
  return false}

function basesomeexit (n,x,pl,al,cont,results,facts,rules)
 {if (pl.length!==0)
     {return basesome(n,x,pl[0],tail(pl),al,cont,results,facts,rules)};
  if (nullp(cont))
     {results.push(pluug(x,al,al));
      if (typeof(n)==='number' && results.length>=n) {return results};
      return false};
  return basesomeexit(n,x,cont[0],cont[1],cont[2],results,facts,rules)}

//------------------------------------------------------------------------------

function basevalue (p,facts,rules)
 {if (varp(p)) {return false};
  if (symbolp(p)) {return p};
  if (p[0]==='choose') {return basevaluechoose(p,facts,rules)};
  if (p[0]==='if') {return basevalueif(p,facts,rules)};
  var args = seq();
  for (var i=1; i<p.length; i++)
      {var arg = basevalue(p[i],facts,rules);
       if (arg!==false) {args[i-1] = arg} else {return false}};
  return baseapply(p[0],args,facts,rules)}

function basevaluesetofall (p,facts,rules)
 {return listify(basefinds(p[1],p[2],facts,rules))}
  
function basevaluecountofall (p,facts,rules)
 {return basefinds(p[1],p[2],facts,rules).length.toString()}

function basevaluechoose (p,facts,rules)
 {var possibilities = basefinds(p[1],p[2],facts,rules);
  var n = Math.floor(Math.random()*possibilities.length);
  return possibilities[n]}

function basevalueif (p,facts,rules)
 {for (var i=1; i<p.length; i=i+2)
      {if (basefindp(p[i],facts,rules))
          {return basevalue(p[i+1],facts,rules)}};
  return false}

function baseapply (fun,args,facts,rules)
 {return baseapplyrs (fun,args,facts,rules)}

function baseapplybuiltin (fun,args,facts,rules)
 {return eval(fun).apply(null,args)}

function baseapplymath (fun,args,facts,rules)
 {return stringize(Math[fun].apply(null,args))}

function baseapplylist (fun,args,facts,rules)
 {var args = numlistify(args[0]);
  return stringize(eval(fun).call(null,args))}

function baseapplyrs (fun,args,facts,rules)
 {var result = seq(fun).concat(args);
  //var data = indexees('definition',rules);
  var data = lookuprules(fun,rules);
  var flag = false;
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (data[i][0]==='definition')
          {if (operator(data[i][1])===fun) {flag = true};
           if (vnifyp(data[i][1],bl,result,bl,ol))
              {var term = pluug(data[i][2],bl,bl);
               var answer = basevalue(term,facts,rules);
               backup(ol);
               if (answer) {return answer}}}}
  if (flag) {return false};
  return result}

//==============================================================================
// Full inference
//==============================================================================
//------------------------------------------------------------------------------
// compfindp
// compfindx
// compfinds
// compfindn
// compfindg
// sortfinds
// compvalue
//------------------------------------------------------------------------------

function compfindp (query,facts,rules)
 {return (compfindx('true',query,facts,rules)==='true')}

function compfindx (result,query,facts,rules)
 {var answers = compfindn(1,result,query,facts,rules);
  if (answers.length>0) {return answers[0]};
  return false}

function compfinds (result,query,facts,rules)
 {return zniquify(compfindn(true,result,query,facts,rules))}

function compfindn (n,result,query,facts,rules)
 {var results = [];
  if (typeof(n)==='number' && n<=0) {return results};
  compsome(n,result,query,seq(),{},nil,results,facts,rules);
  return results}

function compfindg (result,query,facts,rules)
 {return compgen(result,query,facts,rules)}

function sortfinds (result,query,facts,rules)
 {return vniquify(compfindn(true,result,query,facts,rules))}

//------------------------------------------------------------------------------

function compsome (n,x,p,pl,al,cont,results,facts,rules)
 {//inferences = inferences + 1;
  var answer = false;
  if (symbolp(p))
     {return compsomeatom(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='same')
     {return compsomesame(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='distinct')
     {return compsomedistinct(n,x,p,pl,al,cont,results,facts,rules)}
  if (specialp(p[0]))
     {return compsomeeval(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='matches')
     {return compsomematches(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='submatches')
     {return compsomesubmatches(n,x,p,pl,al,cont,results,facts,rules)}
  if (builtinp(p[0]))
     {return compsomecall(n,x,p,pl,al,cont,results,facts,rules)}
  if (mathp(p[0]))
     {return compsomemath(n,x,p,pl,al,cont,results,facts,rules)}
  if (listop(p[0]))
     {return compsomelist(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='map')
     {return compsomemap(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='setofall')
     {return compsomesetofall(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='countofall')
     {return compsomecountofall(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='evaluate')
     {return compsomeevaluate(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='member')
     {return compsomemember(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='not')
     {return compsomenot(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='and')
     {return compsomeand(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='or')
     {return compsomeor(n,x,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='true')
     {return compsometrue(n,x,p,pl,al,cont,results,facts,rules)}
  if (basep(p[0],rules))
     {return compsomebase(n,x,p,pl,al,cont,results,facts,rules)};
  return compsomeview(n,x,p,pl,al,cont,results,facts,rules)}

function compsomeatom (n,x,p,pl,al,cont,results,facts,rules)
 {if (p==='true')
     {return compsomeexit(n,x,pl,al,cont,results,facts,rules)};
  if (p==='false')
     {return false};
  if (basep(p,rules))
     {return compsomebase(n,x,p,pl,al,cont,results,facts,rules)};
  return compsomeground(n,x,p,pl,al,cont,results,facts,rules)}

function compsomesame (n,x,p,pl,al,cont,results,facts,rules)
 {var ol = seq();
  if (vnifyp(p[1],al,p[2],al,ol))
     {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  return false}

function compsomedistinct (n,x,p,pl,al,cont,results,facts,rules)
 {var ol = seq();
  if (vnifyp(p[1],al,p[2],al,ol)) {backup(ol); return false};
  return compsomeexit(n,x,pl,al,cont,results,facts,rules)}

function compsomematches (n,x,p,pl,al,cont,results,facts,rules)
 {var str = pluug(p[1],al,al);
  if (!stringp(str)) {return false};
  str = str.substring(1,str.length-1);
  var pat = pluug(p[2],al,al);
  if (!stringp(pat)) {return false};
  pat = pat.substring(1,pat.length-1);
  var re=new RegExp(pat,'g');
  var fragments = re.exec(str);
  if (fragments!=null)
     {var ol = seq();
      for (var i=3; i<p.length; i++)
          {var result = '"' + fragments[i-2] + '"';
           if (!vnifyp(p[i],al,result,al,ol))
              {backup(ol); return false}};
      var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol)
      return answer};
  return false}

function compsomesubmatches (n,x,p,pl,al,cont,results,facts,rules)
 {var str = pluug(p[1],al,al);
  str = str.substring(1,str.length-1);
  var pat = pluug(p[2],al,al);
  pat = pat.substring(1,pat.length-1);
  if (symbolp(str))
     {var re=new RegExp(pat,'g');
      var matches = str.match(re);
      if (matches!=null)
         {for (var i=0; i<matches.length; i++)
              {var ol = seq();
               var result = '"' + matches[i] + '"';
               if (vnifyp(p[3],al,result,al,ol))
                  {answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
                   backup(ol);
                   if (answer) {return answer}}}}};
  return false}

function compsomeeval (n,x,p,pl,al,cont,results,facts,rules)
 {var args = seq();
  for (var i=1; i<p.length; i++)
      {var arg = pluug(p[i],al,al);
       if (varp(arg)) {return false} else {args[args.length] = arg}};
  var val = eval(p[0]).apply(null,args);
  if (!val) {return false};
  return compsomeexit(n,x,pl,al,cont,results,facts,rules)}

function compsomecall (n,x,p,pl,al,cont,results,facts,rules)
 {var args = seq();
  for (var i=1; i<p.length-1; i++)
      {var arg = pluug(p[i],al,al);
       if (varp(arg)) {return false} else {args[args.length] = arg}};
  var val = eval(p[0]).apply(null,args);
  if (!val) {return false};
  var ol = seq();
  if (vnifyp(p[p.length-1],al,val,al,ol))
     {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  return false}

function compsomemath (n,x,p,pl,al,cont,results,facts,rules)
 {var args = seq();
  for (var i=1; i<p.length-1; i++)
      {var arg = numberize(pluug(p[i],al,al));
       if (isNaN(arg)) {return false};
       args[args.length] = arg};
  var val = stringize(Math[p[0]].apply(null,args));
  var ol = seq();
  if (vnifyp(p[p.length-1],al,val,al,ol))
     {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  return false}

function compsomelist (n,x,p,pl,al,cont,results,facts,rules)
 {var c = pluug(p[1],al,al);
  var s = numlistify(c);
  if (s===false) {return false};
  var val = stringize(eval(p[0]).call(null,s));
  var ol = seq();
  if (vnifyp(p[2],al,val,al,ol))
     {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  return false}

function compsomemap (n,x,p,pl,al,cont,results,facts,rules)
 {if (!symbolp(p[1]) || varp(p[1])) {return false};
  var val = map(p[1],pluug(p[2],al,al),facts,rules);
  if (val===false) {return false};
  var ol = seq();
  if (vnifyp(p[3],al,val,al,ol))
     {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  return false}

function compsomesetofall (n,x,p,pl,al,cont,results,facts,rules)
 {p = pluug(p,al,al);
  var ol = seq();
  var result = listify(compfinds(p[1],p[2],facts,rules));
  if (vnifyp(p[3],al,result,al,ol))
     {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  return false}

function compsomecountofall (n,x,p,pl,al,cont,results,facts,rules)
 {p = pluug(p,al,al);
  var answers = seq();
  compsome(true,p[1],p[2],seq(),al,nil,answers,facts,rules);
  answers = vniquify(answers);
  var ol = seq();
  if (vnifyp(p[3],al,answers.length.toString(),al,ol))
     {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  return false}

function compsomeevaluate (n,x,p,pl,al,cont,results,facts,rules)
 {var val = compvalue(pluug(p[1],al,al),facts,rules);
  var ol = seq();
  if (val && vnifyp(p[2],al,val,al,ol))
     {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  return false}

function compsomemember (n,x,p,pl,al,cont,results,facts,rules)
 {var item = p[1];
  var list = pluug(p[2],al,al);
  var ol = [];
  while (!symbolp(list) && list[0]==='cons')
   {if (vnifyp(item,al,list[1],al,ol))
       {answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
        backup(ol);
        if (answer) {return answer}};
    list = list[2]};
  return false}

function compsometrue (n,x,p,pl,al,cont,results,facts,rules)
 {var ds = getdataset(p[2]);
  var data = envlookupfacts(p[1],al,ds);
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       var answer;
       if (vnifyp(data[i],bl,p[1],al,ol))
          {answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
           backup(ol);
           if (answer) {return answer}}};
  return false}

function compsomenot (n,x,p,pl,al,cont,results,facts,rules)
 {if (compsome(1,x,p[1],seq(),al,nil,[],facts,rules)===false)
     {return compsomeexit(n,x,pl,al,cont,results,facts,rules)};
  return false}

function compsomeand (n,x,p,pl,al,cont,results,facts,rules)
 {return compsomeexit(n,x,concatenate(tail(p),pl),al,cont,results,facts,rules)}

function compsomeor (n,x,p,pl,al,cont,results,facts,rules)
 {var answer;
  for (var i=1; i<p.length; i++)
      {if (answer = compsome(n,x,p[i],pl,al,cont,results,facts,rules))
          {return answer}};
  return false}

function compsomebase (n,x,p,pl,al,cont,results,facts,rules)
 {var data = envlookupfacts(p,al,facts);
  for (var i=0; i<data.length; i++)
      {instantiations++;
       var bl = {};
       var ol = seq();
       if (vnifyp(data[i],bl,p,al,ol))
          {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
           backup(ol);
           if (answer) {return answer}}};
  return false}

function compsomeground (n,x,p,pl,al,cont,results,facts,rules)
 {if (compsomeview(1,x,p,seq(),al,nil,[],facts,rules))
     {return compsomeexit(n,x,pl,al,cont,results,facts,rules)};
  return false}

function compsomeview (n,x,p,pl,al,cont,results,facts,rules)
 {var data = lookuprules(p,rules);
  for (var i=0; i<data.length; i++)
      {inferences++;
       var bl = {};
       var ol = seq();
       if (data[i][0]==='rule')
          {if (vnifyp(data[i][1],bl,p,al,ol))
              {var ql = data[i].slice(2);
               var nc = seq(pl,al,cont);
               var answer = compsomeexit(n,x,ql,bl,nc,results,facts,rules);
               backup(ol);
               if (answer) {return answer}}}
       else {if (vnifyp(data[i],bl,p,al,ol))
                {var answer = compsomeexit(n,x,pl,al,cont,results,facts,rules);
                 backup(ol);
                 if (answer) {return answer}}}}
  return false}

function compsomeexit (n,x,pl,al,cont,results,facts,rules)
 {if (pl.length!==0)
     {return compsome(n,x,pl[0],tail(pl),al,cont,results,facts,rules)};
  if (nullp(cont))
     {results.push(pluug(x,al,al));
      if (typeof(n)==='number' && results.length>=n) {return results};
      return false};
  return compsomeexit(n,x,cont[0],cont[1],cont[2],results,facts,rules)}

//------------------------------------------------------------------------------
// compgen
// call
//------------------------------------------------------------------------------

function compgen (x,p,facts,rules)
 {var type = gettype(p,rules);
  var al = {};
  var toplevel = {};
  toplevel.type = 'toplevel';
  toplevel.aspect = x;
  toplevel.alist = al;
  return makeframe(type,p,al,facts,rules,'call',toplevel)}

function gettype (p,rules)
 {if (symbolp(p)) {return 'atom'};
  if (p[0]==='same') {return 'same'};
  if (p[0]==='distinct') {return 'distinct'};
  if (specialp(p[0])) {return 'special'};
  if (p[0]==='evaluate') {return 'evaluation'};
  if (p[0]==='member') {return 'member'};
  if (p[0]==='not') {return 'negation'};
  if (p[0]==='and') {return 'conjunction'};
  if (p[0]==='or') {return 'disjunction'};
  if (p[0]==='rule') {return 'rule'};
  if (p[0]==='true') {return 'true'};
  if (basep(p[0],rules)) {return 'base'};
  return 'view'}

function makeframe (type,p,al,facts,rules,task,caller)
 {var frame = {};
  frame.type = type;
  frame.query = p;
  frame.alist = al;
  frame.facts = facts;
  frame.rules = rules;
  frame.task = task;
  frame.caller = caller;
  return frame}

//------------------------------------------------------------------------------

var framelimit = 100000;

function callx (gen)
 {return call(gen)}

function calln (n,gen)
 {if (typeof(n)==='number' && n<=0) {return []};
  var i = 0;
  var answer;
  var results = [];
  var resultmap = {};
  while (i<n && (answer = call(gen)))
   {var ind = grindem(answer);
    if (!(ind in resultmap))
       {results.push(answer); resultmap[ind] = 1; i++}} 
  return results}

function calls (gen)
 {var answer;
  var results = [];
  var resultmap = {};
  while (answer = call(gen))
   {var ind = grindem(answer);
    if (!(ind in resultmap))
       {results.push(answer); resultmap[ind] = 1}} 
  return results}

function call (frame)
 {if (frame.caller.task) {frame.task = 'redo'};
  return loop(frame)}

function loop (frame)
 {while (true)
   {//console.log(frame.task + ': '); console.log(frame);
    if (instantiations + inferences >= framelimit) {return false};
    if (frame.type==='toplevel')
       {if (frame.task==='next')
           {return pluug(frame.aspect,frame.alist,frame.alist)};
        if (frame.task==='back') {return false};
        return false};
    frame = processframe(frame)}}

function processframe (frame)
 {var task = frame.task;
  if (task==='call') {return callframe(frame)};
  if (task==='redo') {return redoframe(frame)};
  if (task==='next') {return nextframe(frame)};
  if (task==='back') {return backframe(frame)};
  return false}

function callframe (frame)
 {if (frame.type==='atom') {return callatom(frame)};
  if (frame.type==='same') {return callsame(frame)};
  if (frame.type==='distinct') {return calldistinct(frame)};
  if (frame.type==='special') {return calleval(frame)};
  if (frame.type==='evaluation') {return callevaluation(frame)};
  if (frame.type==='member') {return callmember(frame)};
  if (frame.type==='negation') {return callnegation(frame)};
  if (frame.type==='conjunction') {return callconjunction(frame)};
  if (frame.type==='disjunction') {return calldisjunction(frame)};
  if (frame.type==='true') {return calltrue(frame)};
  if (frame.type==='base') {return callbase(frame)};
  if (frame.type==='view') {return callview(frame)};
  if (frame.type==='rule') {return callrule(frame)};
  return false}

function redoframe (frame)
 {if (frame.type==='atom') {return redoatom(frame)};
  if (frame.type==='same') {return redosame(frame)};
  if (frame.type==='distinct') {return redodistinct(frame)};
  if (frame.type==='special') {return redoeval(frame)};
  if (frame.type==='evaluation') {return redoevaluation(frame)};
  if (frame.type==='member') {return redomember(frame)};
  if (frame.type==='negation') {return redonegation(frame)};
  if (frame.type==='conjunction') {return redoconjunction(frame)};
  if (frame.type==='disjunction') {return redodisjunction(frame)};
  if (frame.type==='true') {return redotrue(frame)};
  if (frame.type==='base') {return redobase(frame)};
  if (frame.type==='view') {return redoview(frame)};
  if (frame.type==='rule') {return redorule(frame)};
  return false}

function nextframe (frame)
 {if (frame.type==='atom') {return nextatom(frame)};
  if (frame.type==='negation') {return nextnegation(frame)};
  if (frame.type==='conjunction') {return nextconjunction(frame)};
  if (frame.type==='disjunction') {return nextdisjunction(frame)};
  if (frame.type==='view') {return nextview(frame)};
  if (frame.type==='rule') {return nextrule(frame)};
  return false}

function backframe (frame)
 {if (frame.type==='atom') {return backatom(frame)};
  if (frame.type==='negation') {return backnegation(frame)};
  if (frame.type==='conjunction') {return backconjunction(frame)};
  if (frame.type==='disjunction') {return backdisjunction(frame)};
  if (frame.type==='view') {return backview(frame)};
  if (frame.type==='rule') {return backrule(frame)};
  return false}

//------------------------------------------------------------------------------

function callatom (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var facts = frame.facts;
  var rules = frame.rules;
  if (query==='true') {frame.caller.task = 'next'; return frame.caller};
  if (query==='false') {frame.caller.task = 'back'; return frame.caller};
  if (basep(query,rules))
     {return makeframe('base',query,alist,facts,rules,'call',frame)};
  return makeframe('view',query,alist,facts,rules,'call',frame)}

function redoatom (frame)
 {frame.caller.task = 'back';
  return frame.caller}

function nextatom (frame)
 {frame.caller.task = 'next';
  return frame.caller}

function backatom (frame)
 {frame.caller.task = 'back';
  return frame.caller}

//------------------------------------------------------------------------------

function callsame (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var ol = [];
  frame.ol = ol;
  if (vnifyp(query[1],alist,query[2],alist,ol))
     {frame.caller.task = 'next';
      return frame.caller};
  frame.caller.task = 'back';
  return frame.caller}

function redosame (frame)
 {var ol = frame.ol;
  backup(ol);
  frame.caller.task = 'back';
  return frame.caller}

//------------------------------------------------------------------------------

function calldistinct (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var ol = [];
  if (vnifyp(query[1],alist,query[2],alist,ol))
     {backup(ol);
      frame.caller.task = 'back';
      return frame.caller};
  frame.caller.task = 'next';
  return frame.caller}

function redodistinct (frame)
 {frame.caller.task = 'back';
  return frame.caller}

//------------------------------------------------------------------------------

function calleval (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var args = seq();
  for (var i=1; i<query.length; i++)
      {var arg = pluug(query[i],alist,alist);
       if (varp(arg)) {frame.caller.task = 'back'; return frame.caller}
          else {args[args.length] = arg}};
  if (eval(query[0]).apply(null,args))
     {frame.caller.task = 'next';
      return frame.caller};
  frame.caller.task = 'back';
  return frame.caller}

function redoeval (frame)
 {frame.caller.task = 'back';
  return frame.caller}

//------------------------------------------------------------------------------

function callevaluation (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var facts = frame.facts;
  var rules = frame.rules;
  var val = compvalue(pluug(query[1],alist,alist),facts,rules);
  var ol = [];
  frame.ol = ol;
  if (val && vnifyp(query[2],alist,val,alist,ol))
     {frame.caller.task = 'next';
      return frame.caller};
  frame.caller.task = 'back';
  return frame.caller}

function redoevaluation (frame)
 {var ol = frame.ol;
  backup(ol);
  frame.caller.task = 'back';
  return frame.caller}

//------------------------------------------------------------------------------

function callmember (frame)
 {var query = frame.query;
  var alist = frame.alist;
  frame.list = pluug(query[2],alist,alist);
  frame.ol = [];
  return redomember(frame)}

function redomember (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var item = query[1];
  var list = frame.list;
  var ol = frame.ol;
  backup(ol);
  while (!symbolp(list) && list[0]==='cons')
   {if (vnifyp(item,alist,list[1],alist,ol))
       {list = list[2];
        frame.list = list;
        frame.caller.task = 'next';
        return frame.caller};
    list = list[2]};
  frame.list = list;
  frame.caller.task = 'back';
  return frame.caller}

//------------------------------------------------------------------------------

function callnegation (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var facts = frame.facts;
  var rules = frame.rules;
  var subgoal = query[1];
  var type = gettype(subgoal,rules);
  return makeframe(type,query[1],alist,facts,rules,'call',frame)}

function redonegation (frame)
 {frame.caller.task = 'back';
  return frame.caller}

function nextnegation (frame)
 {frame.caller.task = 'back';
  return frame.caller}

function backnegation (frame)
 {frame.caller.task = 'next';
  return frame.caller}

//------------------------------------------------------------------------------

function callconjunction (frame)
 {frame.index = 0;
  frame.generators = [];
  frame.task = 'next';
  return nextconjunction(frame)}

function redoconjunction (frame)
 {var query = frame.query;
  var index = frame.index;
  if (frame.generators)
     {frame.generators[index].task = 'redo';
      return frame.generators[index]};
  return backconjunction(frame)}

function nextconjunction (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var facts = frame.facts;
  var rules = frame.rules;
  var index = frame.index;
  if (index===query.length-1)
     {frame.caller.task = 'next';
      return frame.caller};
  index++;
  frame.index = index;
  var subgoal = query[index];
  var type = gettype(subgoal,rules);
  var subframe = makeframe(type,subgoal,alist,facts,rules,'call',frame);
  frame.generators[index] = subframe;
  return subframe}

function backconjunction (frame)
 {var index = frame.index;
  if (index===1)
     {frame.caller.task = 'back';
      return frame.caller};
  index--;
  frame.index = index;
  frame.generators[index].task = 'redo';
  return frame.generators[index]}

//------------------------------------------------------------------------------

function calldisjunction (frame)
 {var query = frame.query;
  if (query.length===1)
     {frame.caller.task = 'back';
      return frame.caller};
  frame.index = 0;
  return backdisjunction(frame)}

function redodisjunction (frame)
 {var query = frame.query;
  var index = frame.index;
  if (query.length===1)
     {frame.caller.task = 'back';
      return frame.caller};
  var subframe = frame.generator;
  subframe.task = 'redo';
  return subframe}

function nextdisjunction (frame)
 {frame.caller.task = 'next';
  return frame.caller}

function backdisjunction (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var facts = frame.facts;
  var rules = frame.rules;
  var index = frame.index;
  index++;
  frame.index = index;
  if (index>=query.length)
     {frame.caller.task = 'back';
      return frame.caller};
  var subgoal = query[index];
  var type = gettype(subgoal,rules);
  var subframe = makeframe(type,subgoal,alist,facts,rules,'call',frame);
  frame.generator = subframe;
  return subframe}

//------------------------------------------------------------------------------

function callbase (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var facts = frame.facts;
  frame.data = envlookupfacts(query,alist,facts)
  frame.index = 0;
  frame.ol = [];
  return redobase(frame)}

function redobase (frame)
 {var p = frame.query;
  var al = frame.alist;
  var data = frame.data;
  var index = frame.index;
  var ol = frame.ol;
  backup(ol);
  while (index<data.length)
   {instantiations++;
    if (vnifyp(p,al,data[index],al,ol))
       {index++;
        frame.index = index;
        frame.caller.task = 'next';
        return frame.caller};
    index++};
  frame.index = index;
  frame.caller.task = 'back';
  return frame.caller}

//------------------------------------------------------------------------------

function calltrue (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var ds = getdataset(query[2]);
  var data = envlookupfacts(query[1],alist,ds);
  frame.data = data;
  frame.index = 0;
  frame.ol = [];
  return redotrue(frame)}

function redotrue (frame)
 {var query = frame.query;
  var alist = frame.alist;
  var data = frame.data;
  var index = frame.index;
  var ol = frame.ol;
  backup(ol);
  while (index<data.length)
   {instantiations++;
    if (vnifyp(query[1],alist,data[index],alist,ol))
       {index++;
        frame.index = index;
        frame.caller.task = 'next';
        return frame.caller};
    index++};
  frame.index = index;
  frame.caller.task = 'back';
  return frame.caller}

//------------------------------------------------------------------------------

function callview (frame)
 {frame.data = lookuprules(frame.query,frame.rules);
  frame.index = 0;
  frame.blist = {};
  frame.ol = [];
  frame.task = 'redo';
  return backview(frame)}

function redoview (frame)
 {var subframe = frame.generator;
  if (subframe)
     {subframe.task = 'redo';
      return subframe};
  return backview(frame)}

function nextview (frame)
 {frame.caller.task = 'next';
  return frame.caller}

function backview (frame)
 {var p = frame.query;
  var al = frame.alist;
  var bl = frame.blist;
  var facts = frame.facts;
  var rules = frame.rules;
  var data = frame.data;
  var index = frame.index;
  var ol = frame.ol;
  backup(ol);
  while (index<data.length)
   {inferences++;
    var datum = data[index];
    index++;
    if (datum[0]==='rule')
       {if (vnifyp(datum[1],bl,p,al,ol))
           {frame.index = index;
            var subframe = makeframe('rule',datum,bl,facts,rules,'call',frame);
            frame.generator = subframe;
            return subframe}}
    else if (vnifyp(p,al,datum,bl,ol))
            {frame.index = index;
             frame.caller.task = 'next';
             return frame.caller}};
  frame.index = index;
  frame.caller.task = 'back';
  return frame.caller}

//------------------------------------------------------------------------------

function callrule (frame)
 {frame.index = 1;
  frame.generators = [];
  frame.task = 'next';
  return nextrule(frame)}

function redorule (frame)
 {var query = frame.query;
  var index = frame.index;
  if (frame.generators)
     {frame.generators[index].task = 'redo';
      return frame.generators[index]};
  return backrule(frame)}

function nextrule (frame)
 {var rule = frame.query;
  var alist = frame.alist;
  var facts = frame.facts;
  var rules = frame.rules;
  var index = frame.index;
  if (index===rule.length-1)
     {frame.caller.task = 'next';
      return frame.caller};
  index++;
  frame.index = index;
  var subgoal = rule[index];
  var type = gettype(subgoal,rules);
  var subframe = makeframe(type,subgoal,alist,facts,rules,'call',frame);
  frame.generators[index] = subframe;
  return subframe}

function backrule (frame)
 {var index = frame.index;
  if (index===2)
     {frame.caller.task = 'back';
      return frame.caller};
  index--;
  frame.index = index;
  frame.generators[index].task = 'redo';
  return frame.generators[index]}

//------------------------------------------------------------------------------

function compvalue (p,facts,rules)
 {if (varp(p)) {return false};
  if (symbolp(p)) {return p};
  if (p[0]==='map') {return compvaluemap(p,facts,rules)};
  if (p[0]==='setofall') {return compvaluesetofall(p,facts,rules)};
  if (p[0]==='countofall') {return compvaluecountofall(p,facts,rules)};
  if (p[0]==='choose') {return compvaluechoose(p,facts,rules)};
  if (p[0]==='if') {return compvalueif(p,facts,rules)};
  var args = seq();
  for (var i=1; i<p.length; i++)
      {var arg = compvalue(p[i],facts,rules);
       if (arg!==false) {args[i-1] = arg} else {return false}};
  return compapply(p[0],args,facts,rules)}

function compvaluemap (p,facts,rules)
 {var fun = compvalue(p[1],facts,rules);
  var arglist = compvalue(p[2],facts,rules);
  return compval(fun,arglist,facts,rules)}

function compval (fun,arglist,facts,rules)
 {if (arglist===nil) {return nil};
  if (symbolp(arglist) || arglist[0]!=='cons') {return false};
  var result = compapply(fun,seq(arglist[1]),facts,rules);
  if (result===false) {return false};
  var results = compval(fun,arglist[2],facts,rules);
  if (results===false) {return false};
  return seq('cons',result,results)}

function compvaluesetofall (p,facts,rules)
 {return listify(compfinds(p[1],p[2],facts,rules))}
  
function compvaluecountofall (p,facts,rules)
 {return compfinds(p[1],p[2],facts,rules).length.toString()}

function compvaluechoose (p,facts,rules)
 {var possibilities = compfinds(p[1],p[2],facts,rules);
  if (possibilities.length===0) {return false};
  var n = Math.floor(Math.random()*possibilities.length);
  return possibilities[n]}

function compvalueif (p,facts,rules)
 {for (var i=1; i<p.length; i=i+2)
      {var result = compfindx(p[i+1],p[i],facts,rules);
       if (result) {return compvalue(result,facts,rules)}};
  return false}

function compapply (fun,args,facts,rules)
 {if (builtinp(fun)) {return compapplybuiltin(fun,args,facts,rules)};
  if (mathp(fun)) {return compapplymath(fun,args,facts,rules)};
  if (listop(fun)) {return compapplylist(fun,args,facts,rules)};
  return compapplyrs (fun,args,facts,rules)}

function compapplybuiltin (fun,args,facts,rules)
 {return eval(fun).apply(null,args)}

function compapplymath (fun,args,facts,rules)
 {return stringize(Math[fun].apply(null,args))}

function compapplylist (fun,args,facts,rules)
 {var args = numlistify(args[0]);
  return stringize(eval(fun).call(null,args))}

function compapplyrs (fun,args,facts,rules)
 {var result = seq(fun).concat(args);
  //var data = indexees('definition',rules);
  var data = lookuprules(fun,rules);
  var flag = false;
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (data[i][0]==='definition')
          {if (operator(data[i][1])===fun) {flag = true};
           if (vnifyp(data[i][1],bl,result,bl,ol))
              {var term = pluug(data[i][2],bl,bl);
               var answer = compvalue(term,facts,rules);
               backup(ol);
               if (answer) {return answer}}}}
  if (flag) {return false};
  return result}

//------------------------------------------------------------------------------

var exportables = [];

function compexecute (seed,facts,rules)
 {var updates = compexpand(seed,facts,rules);
  var outputs = [];
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {continue};
       if (update[0]==='delete') {compdrop(update[1],facts)};
       if (update[0]==='not') {compdrop(update[1],facts)}};
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {compsave(update,facts); continue};
       if (update[0]==='insert') {compsave(update[1],facts); continue};
       if (update[0]==='enqueue') {outputs.push(update[1]); continue};
       if (findq(update[0],exportables)) {outputs.push(update); continue};
       if (update[0]==='not') {continue};
       compsave(update,facts)};
  return outputs}

function compexpand (seed,facts,rules)
 {if (symbolp(seed)) {return compexpandrs(seed,facts,rules)};
  if (seed[0]==='not') {return [seed]};
  if (seed[0]==='and')
     {var updates = [];
      for (var i=1; i<seed.length; i++)
          {updates = updates.concat(compexpand(seed[i],facts,rules))}
      return updates};
  if (seed[0]==='transition') {return compexpandtransition(seed,facts,rules)};
  return compexpandrs(seed,facts,rules)}

function compexpandtransition (seed,facts,rules)
 {var updates = [];
  var changes = compfinds(seed[2],seed[1],facts,rules);
  for (j=0; j<changes.length; j++)
      {updates = updates.concat(compexpand(changes[j],facts,rules))};
  return updates}

function compexpandrs (seed,facts,rules)
 {var updates = [];
  //var data = indexees('handler',rules);
  var data = lookuprules(seed,rules);
  var flag = false;
  for (var i=0; i<data.length; i++)
      {if (symbolp(data[i])) {continue};
       if (data[i][0]!=='handler') {continue};
       var bl;
       if (bl = matcher(data[i][1],seed))
          {flag = true;
           var rule = plug(data[i][2],bl);
           updates = updates.concat(compexpand(rule,facts,rules))}};
  if (flag) {return updates};
  return [seed]}

var expanddepth = 100;

function compexpand (seed,facts,rules)
 {return zniquify(compexpanddepth(seed,facts,rules,0))}

function compexpanddepth (seed,facts,rules,depth)
 {if (symbolp(seed)) {return compexpanddepthrs(seed,facts,rules,depth)};
  if (seed[0]==='not') {return [seed]};
  if (seed[0]==='and') {return compexpanddepthand(seed,facts,rules,depth)};
  if (seed[0]==='transition') {return compexpanddepthtransition(seed,facts,rules,depth)};
  if (depth>expanddepth) {return []};
  return compexpanddepthrs(seed,facts,rules,depth)}

function compexpanddepthand (seed,facts,rules,depth)
 {var updates = [];
  for (var i=1; i<seed.length; i++)
      {updates = updates.concat(compexpanddepth(seed[i],facts,rules,depth))};
  return updates}

function compexpanddepthtransition (seed,facts,rules,depth)
 {var updates = [];
  var changes = compfinds(seed[2],seed[1],facts,rules);
  for (var i=0; i<changes.length; i++)
      {updates = updates.concat(compexpanddepth(changes[i],facts,rules,depth))};
  return updates}

function compexpanddepthrs (seed,facts,rules,depth)
 {//var data = indexees('handler',rules);
  var data = lookuprules(seed,rules);
  var flag = false;
  var updates = [];
  for (var i=0; i<data.length; i++)
      {if (symbolp(data[i])) {continue};
       if (data[i][0]!=='handler') {continue};
       var bl;
       if (bl = matcher(data[i][1],seed))
          {flag = true;
           var rule = plug(data[i][2],bl);
           updates = updates.concat(compexpanddepth(rule,facts,rules,depth+1))}};
  if (flag) {return updates};
  return [seed]}

function compsave (p,facts)
 {if (symbolp(p)) {return savefact(p,facts)};
  if (p[0]==='true') {return putfact(p[1],p[2])};
  return savefact(p,facts)}

function compdrop (p,facts)
 {if (symbolp(p)) {return dropfact(p,facts)};
  if (p[0]==='true') {return remfact(p[1],p[2])};
  return dropfact(p,facts)}

//------------------------------------------------------------------------------

function compupdate (facts,rules)
 {var updates = compupdates(facts,rules);
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {continue};
       if (update[0]==='not') {compdrop(update[1],facts)}};
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {compsave(update,facts)};
       if (update[0]==='not') {continue};
       compsave(update,facts)};
  return true}

function compupdates (facts,rules)
 {var updates = [];
  var data = rules; // indexees('transition',rules);
  for (var i=0; i<data.length; i++)
      {if (!symbolp(data[i]) && data[i][0]==='transition')
          {updates = updates.concat(compexpand(data[i],facts,rules))}};
  return updates}

//------------------------------------------------------------------------------

function comptransform (condition,action,facts,rules)
 {return compexecute(seq('transition',condition,action),facts,rules)}

function comptransform (condition,action,facts,rules)
 {var updates = [];
  var changes = compfinds(action,condition,facts,rules);
  for (i=0; i<changes.length; i++)
      {updates = updates.concat(compexpand(changes[i],facts,rules))};
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {continue};
       if (update[0]==='not') {compdrop(update[1],facts)}};
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {compsave(update,facts)};
       if (update[0]==='not') {continue};
       compsave(update,facts)};
  return true}

//==============================================================================
// Hypothetical reasoning
//==============================================================================
//------------------------------------------------------------------------------
// hypofindp
// hypofindx
// hypofinds
// hypofindn
// hypovalue
//------------------------------------------------------------------------------

function hypofindp (query,adds,dels,facts,rules)
 {return hypofindx('true',query,adds,dels,facts,rules)}

function hypofindx (result,query,adds,dels,facts,rules)
 {var answers = hypofindn(1,result,query,adds,dels,facts,rules);
  if (answers.length>0) {return answers[0]};
  return false}

function hypofinds (result,query,adds,dels,facts,rules)
 {return zniquify(hypofindn(true,result,query,adds,dels,facts,rules))}

function hypofindn (n,result,query,adds,dels,facts,rules)
 {var results = [];
  if (typeof(n)==='number' && n<=0) {return results};
  hyposome(n,result,query,seq(),{},nil,results,adds,dels,facts,rules);
  return results}

//------------------------------------------------------------------------------

function hyposome (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {inferences = inferences + 1;
  var answer = false;
  if (symbolp(p))
     {return hyposomeatom(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='same')
     {return hyposomesame(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='distinct')
     {return hyposomedistinct(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='matches')
     {return hyposomematches(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='submatches')
     {return hyposomesubmatches(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (specialp(p[0]))
     {return hyposomeeval(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (builtinp(p[0]))
     {return hyposomecall(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (mathp(p[0]))
     {return hyposomemath(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (listop(p[0]))
     {return hyposomelist(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='map')
     {return hyposomemap(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='setofall')
     {return hyposomesetofall(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='countofall')
     {return hyposomecountofall(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='evaluate')
     {return hyposomeevaluate(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='member')
     {return hyposomemember(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='not')
     {return hyposomenot(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='and')
     {return hyposomeand(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='or')
     {return hyposomeor(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (p[0]==='true')
     {return hyposometrue(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}
  if (basep(p[0],rules))
     {return hyposomebase(n,x,p,pl,al,cont,results,adds,dels,facts,rules)};
  return hyposomeview(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}

function hyposomeatom (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {if (p==='true')
     {return hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules)};
  if (p==='false')
     {return false};
  if (basep(p,rules))
     {return hyposomebase(n,x,p,pl,al,cont,results,adds,dels,facts,rules)};
  return hyposomeground(n,x,p,pl,al,cont,results,adds,dels,facts,rules)}

function hyposomesame (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var ol = seq();
  if (vnifyp(p[1],al,p[2],al,ol))
     {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
      backup(ol);
      return answer};
  return false}

function hyposomedistinct (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var ol = seq();
  if (vnifyp(p[1],al,p[2],al,ol)) {backup(ol); return false};
  return hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules)}

function hyposomematches (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var str = pluug(p[1],al,al);
  if (!stringp(str)) {return false};
  str = str.substring(1,str.length-1);
  var pat = pluug(p[2],al,al);
  if (!stringp(pat)) {return false};
  pat = pat.substring(1,pat.length-1);
  var re=new RegExp(pat,'g');
  var fragments = re.exec(str);
  if (fragments!=null)
     {var ol = seq();
      for (var i=3; i<p.length; i++)
          {var result = '"' + fragments[i-2] + '"';
           if (!vnifyp(p[i],al,result,al,ol))
              {backup(ol); return false}};
      var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
      backup(ol)
      return answer};
  return false}

function hyposomesubmatches (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var str = pluug(p[1],al,al);
  str = str.substring(1,str.length-1);
  var pat = pluug(p[2],al,al);
  pat = pat.substring(1,pat.length-1);
  if (symbolp(str))
     {var re=new RegExp(pat,'g');
      var matches = str.match(re);
      if (matches!=null)
         {for (var i=0; i<matches.length; i++)
              {var ol = seq();
               var result = '"' + matches[i] + '"';
               if (vnifyp(p[3],al,result,al,ol))
                  {answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
                   backup(ol);
                   if (answer) {return answer}}}}};
  return false}

function hyposomeeval (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var args = seq();
  for (var i=1; i<p.length; i++)
      {var arg = pluug(p[i],al,al);
       if (varp(arg)) {return false} else {args[args.length] = arg}};
  var val = eval(p[0]).apply(null,args);
  if (!val) {return false};
  return hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules)}

function hyposomecall (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var args = seq();
  for (var i=1; i<p.length-1; i++)
      {var arg = pluug(p[i],al,al);
       if (varp(arg)) {return false} else {args[args.length] = arg}};
  var val = eval(p[0]).apply(null,args);
  if (!val) {return false};
  var ol = seq();
  if (vnifyp(p[p.length-1],al,val,al,ol))
     {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
      backup(ol);
      return answer};
  return false}

function hyposomemath (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var args = seq();
  for (var i=1; i<p.length-1; i++)
      {var arg = numberize(pluug(p[i],al,al));
       if (isNaN(arg)) {return false};
       args[args.length] = arg};
  var val = stringize(Math[p[0]].apply(null,args));
  var ol = seq();
  if (vnifyp(p[p.length-1],al,val,al,ol))
     {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
      backup(ol);
      return answer};
  return false}

function hyposomelist (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var c = pluug(p[1],al,al);
  var s = numlistify(c);
  if (s===false) {return false};
  var val = stringize(eval(p[0]).call(null,s));
  var ol = seq();
  if (vnifyp(p[2],al,val,al,ol))
     {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
      backup(ol);
      return answer};
  return false}

function hyposomemap (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {if (!symbolp(p[1]) || varp(p[1])) {return false};
  var val = map(p[1],pluug(p[2],al,al),adds,dels,facts,rules);
  if (val===false) {return false};
  var ol = seq();
  if (vnifyp(p[3],al,val,al,ol))
     {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
      backup(ol);
      return answer};
  return false}

function hyposomesetofall (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {p = pluug(p,al,al);
  var ol = seq();
  var result = listify(hypofinds(p[1],p[2],adds,dels,facts,rules));
  if (vnifyp(p[3],al,result,al,ol))
     {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
      backup(ol);
      return answer};
  return false}

function hyposomecountofall (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {p = pluug(p,al,al);
  var answers = seq();
  hyposome(true,p[1],p[2],seq(),al,nil,answers,adds,dels,facts,rules);
  answers = vniquify(answers);
  var ol = seq();
  if (vnifyp(p[3],al,answers.length.toString(),al,ol))
     {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
      backup(ol);
      return answer};
  return false}

function hyposomeevaluate (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var val = hypovalue(pluug(p[1],al,al),adds,dels,facts,rules);
  var ol = seq();
  if (val && vnifyp(p[2],al,val,al,ol))
     {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
      backup(ol);
      return answer};
  return false}

function hyposomemember (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var item = p[1];
  var list = pluug(p[2],al,al);
  var ol = [];
  while (!symbolp(list) && list[0]==='cons')
   {if (vnifyp(item,al,list[1],al,ol))
       {answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
        backup(ol);
        if (answer) {return answer}};
    list = list[2]};
  return false}

function hyposometrue (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var ds = getdataset(p[2]);
  var data = envlookupfacts(p[1],al,ds);
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       var answer;
       if (vnifyp(data[i],bl,p[1],al,ol))
          {answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
           backup(ol);
           if (answer) {return answer}}};
  return false}

function hyposomenot (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {if (hyposome(1,x,p[1],seq(),al,nil,[],adds,dels,facts,rules)===false)
     {return hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules)};
  return false}

function hyposomeand (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {return hyposomeexit(n,x,concatenate(tail(p),pl),al,cont,results,adds,dels,facts,rules)}

function hyposomeor (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var answer;
  for (var i=1; i<p.length; i++)
      {if (answer = hyposome(n,x,p[i],pl,al,cont,results,adds,dels,facts,rules))
          {return answer}};
  return false}

function hyposomebase (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {for (var i=0; i<adds.length; i++)
      {instantiations++;
       var bl = {};
       var ol = seq();
       if (vnifyp(adds[i],bl,p,al,ol))
          {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
           backup(ol);
           if (answer) {return answer}}};
  var data = envlookupfacts(p,al,facts);
  for (var i=0; i<data.length; i++)
      {instantiations++;
       var bl = {};
       var ol = seq();
       if (vnifyp(data[i],bl,p,al,ol))
          {if (!find(data[i],dels))
              {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
               backup(ol);
               if (answer) {return answer}};
           backup(ol)}};
  return false}

function hyposomeground (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {if (hyposomeview(1,x,p,seq(),al,nil,[],adds,dels,facts,rules))
     {return hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules)};
  return false}

function hyposomeview (n,x,p,pl,al,cont,results,adds,dels,facts,rules)
 {var data = lookuprules(p,rules);
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (data[i][0]==='rule')
          {if (vnifyp(data[i][1],bl,p,al,ol))
              {var ql = data[i].slice(2);
               var nc = seq(pl,al,cont);
               var answer = hyposomeexit(n,x,ql,bl,nc,results,adds,dels,facts,rules);
               backup(ol);
               if (answer) {return answer}}}
       else {if (vnifyp(data[i],bl,p,al,ol))
                {var answer = hyposomeexit(n,x,pl,al,cont,results,adds,dels,facts,rules);
                 backup(ol);
                 if (answer) {return answer}}}}
  return false}

function hyposomeexit (n,x,pl,al,cont,results,adds,dels,facts,rules)
 {if (pl.length!==0)
     {return hyposome(n,x,pl[0],tail(pl),al,cont,results,adds,dels,facts,rules)};
  if (nullp(cont))
     {results.push(pluug(x,al,al));
      if (typeof(n)==='number' && results.length>=n) {return results};
      return false};
  return hyposomeexit(n,x,cont[0],cont[1],cont[2],results,adds,dels,facts,rules)}

//------------------------------------------------------------------------------

function hypovalue (p,adds,dels,facts,rules)
 {if (varp(p)) {return false};
  if (symbolp(p)) {return p};
  if (p[0]==='map') {return hypovaluemap(p,adds,dels,facts,rules)};
  if (p[0]==='setofall') {return hypovaluesetofall(p,adds,dels,facts,rules)};
  if (p[0]==='countofall') {return hypovaluecountofall(p,adds,dels,facts,rules)};
  if (p[0]==='choose') {return hypovaluechoose(p,adds,dels,facts,rules)};
  if (p[0]==='if') {return hypovalueif(p,adds,dels,facts,rules)};
  var args = seq();
  for (var i=1; i<p.length; i++)
      {var arg = hypovalue(p[i],adds,dels,facts,rules);
       if (arg!==false) {args[i-1] = arg} else {return false}};
  return hypoapply(p[0],args,adds,dels,facts,rules)}

function hypovaluemap (p,adds,dels,facts,rules)
 {var fun = hypovalue(p[1],adds,dels,facts,rules);
  var arglist = hypovalue(p[2],adds,dels,facts,rules);
  return hypoval(fun,arglist,adds,dels,facts,rules)}

function hypoval (fun,arglist,adds,dels,facts,rules)
 {if (arglist===nil) {return nil};
  if (symbolp(arglist) || arglist[0]!=='cons') {return false};
  var result = hypoapply(fun,seq(arglist[1]),adds,dels,facts,rules);
  if (result===false) {return false};
  var results = hypoval(fun,arglist[2],adds,dels,facts,rules);
  if (results===false) {return false};
  return seq('cons',result,results)}

function hypovaluesetofall (p,adds,dels,facts,rules)
 {return listify(hypofinds(p[1],p[2],adds,dels,facts,rules))}
  
function hypovaluecountofall (p,adds,dels,facts,rules)
 {return hypofinds(p[1],p[2],adds,dels,facts,rules).length.toString()}

function hypovaluechoose(p,adds,dels,facts,rules)
 {var possibilities = hypofinds(p[1],p[2],adds,dels,facts,rules);
  if (possibilities.length===0) {return false};
  var n = Math.floor(Math.random()*possibilities.length);
  return possibilities[n]}

function hypovalueif (p,adds,dels,facts,rules)
 {for (var i=1; i<p.length; i=i+2)
      {if (hypofindp(p[i],adds,dels,facts,rules))
          {return hypovalue(p[i+1],adds,dels,facts,rules)}};
  return false}

function hypoapply (fun,args,adds,dels,facts,rules)
 {if (builtinp(fun)) {return hypoapplybuiltin(fun,args,adds,dels,facts,rules)};
  if (mathp(fun)) {return hypoapplymath(fun,args,adds,dels,facts,rules)};
  if (listop(fun)) {return hypoapplylist(fun,args,adds,dels,facts,rules)};
  return hypoapplyrs (fun,args,adds,dels,facts,rules)}

function hypoapplybuiltin (fun,args,adds,dels,facts,rules)
 {return eval(fun).apply(null,args)}

function hypoapplymath (fun,args,adds,dels,facts,rules)
 {return stringize(Math[fun].apply(null,args))}

function hypoapplylist (fun,args,adds,dels,facts,rules)
 {var args = numlistify(args[0]);
  return stringize(eval(fun).call(null,args))}

function hypoapplyrs (fun,args,adds,dels,facts,rules)
 {var result = seq(fun).concat(args);
  //var data = indexees('definition',rules);
  var data = lookuprules(fun,rules);
  var flag = false;
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (data[i][0]==='definition')
          {if (operator(data[i][1])===fun) {flag = true};
           if (vnifyp(data[i][1],bl,result,bl,ol))
              {var term = pluug(data[i][2],bl,bl);
               var answer = hypovalue(term,adds,dels,facts,rules);
               backup(ol);
               if (answer) {return answer}}}}
  if (flag) {return false};
  return result}

//------------------------------------------------------------------------------

function hypoexecute (seed,adds,dels,facts,rules)
 {var updates = hypoexpand(seed,adds,dels,facts,rules);
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {continue};
       if (update[0]==='not') {compdrop(update[1],facts)}};
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {compsave(update,facts)};
       if (update[0]==='not') {continue};
       compsave(update,facts)};
  return true}

function hypoexpand (seed,adds,dels,facts,rules)
 {if (symbolp(seed)) {return [seed]};
  if (seed[0]==='not') {return [seed]};
  if (seed[0]==='and')
     {var updates = [];
      for (var i=1; i<seed.length; i++)
          {updates = updates.concat(hypoexpand(seed[i],adds,dels,facts,rules))}
      return updates};
  if (seed[0]==='transition')
     {return hypoexpandtransition(seed,adds,dels,facts,rules)};
  return hypoexpandrs(seed,adds,dels,facts,rules)}

function hypoexpandtransition (seed,adds,dels,facts,rules)
 {var updates = [];
  var changes = hypofinds(seed[2],seed[1],adds,dels,facts,rules);
  for (j=0; j<changes.length; j++)
      {updates = updates.concat(hypoexpand(changes[j],adds,dels,facts,rules))};
  return updates}

function hypoexpandrs (seed,adds,dels,facts,rules)
 {var updates = [];
  //var data = indexees('handler',rules);
  var data = lookuprules(seed,rules);
  var flag = false;
  for (var i=0; i<data.length; i++)
      {if (symbolp(data[i])) {continue};
       if (data[i][0]!=='handler') {continue};
       var bl;
       if (bl = matcher(data[i][1],seed))
          {flag = true;
           var rule = plug(data[i][2],bl);
           updates = updates.concat(hypoexpand(rule,adds,dels,facts,rules))}};
  if (flag) {return updates};
  return [seed]}

function hypoexpand (seed,adds,dels,facts,rules)
 {return hypoexpanddepth (seed,adds,dels,facts,rules,0)}

function hypoexpanddepth (seed,adds,dels,facts,rules,depth)
 {if (symbolp(seed)) {return [seed]};
  if (seed[0]==='not') {return [seed]};
  if (seed[0]==='and')
     {return hypoexpanddepthand(seed,adds,dels,facts,rules,depth)};
  if (seed[0]==='transition')
     {return hypoexpanddepthtransition(seed,adds,dels,facts,rules,depth)};
  if (depth>expanddepth) {return []};
  return hypoexpanddepthrs(seed,adds,dels,facts,rules,depth)}

function hypoexpanddepthand (seed,adds,dels,facts,rules,depth)
 {var updates = [];
  for (var i=1; i<seed.length; i++)
      {updates = updates.concat(hypoexpanddepth(seed[i],adds,dels,facts,rules,depth))};
  return updates}

function hypoexpanddepthtransition (seed,adds,dels,facts,rules,depth)
 {var updates = [];
  var changes = hypofinds(seed[2],seed[1],adds,dels,facts,rules);
  for (var i=0; i<changes.length; i++)
      {updates = updates.concat(hypoexpanddepth(changes[i],adds,dels,facts,rules,depth))};
  return updates}

function hypoexpanddepthrs (seed,adds,dels,facts,rules,depth)
 {var updates = [];
  //var data = indexees('handler',rules);
  var data = lookuprules(seed,rules);
  var flag = false;
  for (var i=0; i<data.length; i++)
      {if (symbolp(data[i])) {continue};
       if (data[i][0]!=='handler') {continue};
       var bl;
       if (bl = matcher(data[i][1],seed))
          {flag = true;
           var rule = plug(data[i][2],bl);
           updates = updates.concat(hypoexpanddepth(rule,adds,dels,facts,rules,depth+1))}};
  if (flag) {return updates};
  return [seed]}

//------------------------------------------------------------------------------

function hypoupdate (adds,dels,facts,rules)
 {var updates = hypoupdates(adds,dels,facts,rules);
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {continue};
       if (update[0]==='not') {compdrop(update[1],facts)}};
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {compsave(update,facts)};
       if (update[0]==='not') {continue};
       compsave(update,facts)};
  return true}

function hypoupdates (adds,dels,facts,rules)
 {var updates = [];
  var data = rules; // indexees('transition',rules);
  for (var i=0; i<data.length; i++)
      {var rule = data[i];
       if (!symbolp(rule) && rule[0]==='transition')
          {var changes = hypofinds(rule[2],rule[1],adds,dels,facts,rules);
           for (j=0; j<changes.length; j++)
               {var change = changes[j];
                if (symbolp(change)) {updates.push(change); continue};
                if (change[0]==='and')
                   {updates = updates.concat(change.slice(1)); continue};
                updates.push(change)}}};
  return updates}

//------------------------------------------------------------------------------

function hypotransform (condition,action,adds,dels,facts,rules)
 {var updates = hypofinds(action,condition,adds,dels,facts,rules);
  for (i=0; i<updates.length; i++)
      {updates = updates.concat(hypoexpand(updates[i],adds,dels,facts,rules))};
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {continue};
       if (update[0]==='not') {compdrop(update[1],facts)}};
  for (var i=0; i<updates.length; i++)
      {var update = updates[i];
       if (symbolp(update)) {compsave(update,facts)};
       if (update[0]==='not') {continue};
       compsave(update,facts)};
  return true}

//==============================================================================
// Inference with temporary rules
//==============================================================================
//------------------------------------------------------------------------------
// tempfindp
// tempfindx
// tempfinds
//------------------------------------------------------------------------------

function tempfindp (query,temprules,facts,rules)
 {return tempfindx('true',query,temprules,facts,rules)}

function tempfindx (result,query,temprules,facts,rules)
 {for (var i=0; i<temprules.length; i++) {insertrule(temprules[i],rules)};
  var dum = compfindx(result,query,facts,rules);
  for (var i=0; i<temprules.length; i++) {uninsertrule(temprules[i],rules)};
  return dum}

function tempfinds (result,query,temprules,facts,rules)
 {for (var i=0; i<temprules.length; i++) {insertrule(temprules[i],rules)};
  var answers = compfinds(result,query,facts,rules);
  for (var i=0; i<temprules.length; i++) {uninsertrule(temprules[i],rules)};
  return answers}

//==============================================================================
// trace routines
//==============================================================================
//------------------------------------------------------------------------------
// trace
// untrace
// traces
// tracefindp
// tracefindx
// tracefinds
// tracefindn
//------------------------------------------------------------------------------

var traces = true;

function trace ()
 {if (arguments.length===0) {traces = true; return true};
  if (typeof(traces)!=='object') {traces = []};
  for (var i=0; i<arguments.length; i++)
      {traces = adjoin(arguments[i],traces)};
  return true}

function untrace ()
 {if (arguments.length===0) {traces = []; return true};
  if (typeof(traces)!=='object') {traces = []; return true};
  for (var i=0; i<arguments.length; i++)
      {traces = unjoin(arguments[i],traces)};
  return true}

function tracep (r)
 {if (traces===true) {return true};
  if (typeof(traces)==='object' && find(r,traces)) {return true};
  return false}

function tracedepth (cont)
 {if (cont===nil) {return 0};
  if (tracep(operator(cont[0]))) {return (tracedepth(cont[3])+1)};
  return tracedepth(cont[3])}

function tracecall (p,cont)
 {if (!tracep(operator(p))) {return false};
  console.log("%c%s","font-family:courier",
              grindspaces(tracedepth(cont)) + 'Call: ' + grind(p))}

function traceexit (p,cont)
 {if (!tracep(operator(p))) {return false};
  console.log("%c%s","font-family:courier",
              grindspaces(tracedepth(cont)) + 'Exit: ' + grind(p));}

function traceredo (p,cont)
 {if (!tracep(operator(p))) {return false};
  console.log("%c%s","font-family:courier",
              grindspaces(tracedepth(cont)) + 'Redo: ' + grind(p))}

function tracefail (p,cont)
 {if (!tracep(operator(p))) {return false};
  console.log("%c%s","font-family:courier",
              grindspaces(tracedepth(cont)) + 'Fail: ' + grind(p))}

function grindspaces (n)
 {if (n===0) {return ''};
  return grindspaces(n-1) + '| '}

//------------------------------------------------------------------------------

function tracefindp (query,facts,rules)
 {return debugfindp(query,facts,rules)}

function tracefindx (result,query,facts,rules)
 {return debugfindx(result,query,facts,rules)}

function tracefinds (result,query,facts,rules)
 {return debugfinds(result,query,facts,rules)}

function tracefindn (n,result,query,facts,rules)
 {return debugfindn(n,result,query,facts,rules)}

//==============================================================================
// debug routines
//==============================================================================
//------------------------------------------------------------------------------
// debugfindp
// debugfindx
// debugfinds
// debugfindn
//------------------------------------------------------------------------------

var depth = 100;

function debugfindp (query,facts,rules)
 {return (debugfindx('true',query,facts,rules)==='true')}

function debugfindx (result,query,facts,rules)
 {var answers = debugfindn(1,result,query,facts,rules);
  if (answers.length>0) {return answers[0]};
  return false}

function debugfinds (result,query,facts,rules)
 {return zniquify(debugfindn(true,result,query,facts,rules))}

function debugfindn (n,result,query,facts,rules)
 {var xl = {};
  var answers = [];
  if (typeof(n)==='number' && n<=0) {return answers};
  debugsome(n,result,xl,query,seq(),xl,nil,answers,facts,rules);
  return answers}

function debugdepth (cont)
 {var n = 0;
  for (var c=cont; c!==nil; c = c[3]) {n++};
  return n}

//------------------------------------------------------------------------------

function debugsome (n,x,xl,p,pl,al,cont,results,facts,rules)
 {inferences = inferences + 1;
  if (debugdepth(cont)>depth) {return false};
  if (symbolp(p))
     {return debugsomeatom(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='same')
     {return debugsomesame(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='distinct')
     {return debugsomedistinct(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='matches')
     {return debugsomematches(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='submatches')
     {return debugsomesubmatches(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (specialp(p[0]))
     {return debugsomeeval(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (builtinp(p[0]))
     {return debugsomecall(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (mathp(p[0]))
     {return debugsomemath(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (listop(p[0]))
     {return debugsomelist(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='map')
     {return debugsomemap(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='setofall')
     {return debugsomesetofall(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='countofall')
     {return debugsomecountofall(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='evaluate')
     {return debugsomeevaluate(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='member')
     {return debugsomemember(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='not')
     {return debugsomenot(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='and')
     {return debugsomeand(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='or')
     {return debugsomeor(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (p[0]==='true')
     {return debugsometrue(n,x,xl,p,pl,al,cont,results,facts,rules)}
  if (basep(p[0],rules))
     {return debugsomebase(n,x,xl,p,pl,al,cont,results,facts,rules)};
  return debugsomeview(n,x,xl,p,pl,al,cont,results,facts,rules)}

function debugsomeatom (n,x,xl,p,pl,al,cont,results,facts,rules)
 {if (p==='true')
     {tracecall(p,cont);
      traceexit(p,cont);
      return debugsomeexit(n,x,xl,p,pl,al,cont,results,facts,rules)};
  if (p==='false')
     {tracecall(p,cont);
      tracefail(p,cont);
      return false};
  if (basep(p,rules))
     {return debugsomebase(n,x,xl,p,pl,al,cont,results,facts,rules)};
  return debugsomeview(n,x,xl,p,pl,al,cont,results,facts,rules)}

function debugsomesame (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var ol = seq();
  if (vnifyp(p[1],al,p[2],al,ol))
     {traceexit(pluug(p,al,xl),cont);
      var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  tracefail(goal,cont);
  return false}

function debugsomedistinct (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var ol = seq();
  if (vnifyp(p[1],al,p[2],al,ol))
     {backup(ol);
      tracefail(p,cont);
      return false};
  traceexit(goal,cont);
  return debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules)}

function debugsomematches (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var str = pluug(p[1],al,al);
  if (!stringp(str)) {return false};
  str = str.substring(1,str.length-1);
  var pat = pluug(p[2],al,al);
  if (!stringp(pat)) {return false};
  pat = pat.substring(1,pat.length-1);
  var re=new RegExp(pat,'g');
  var fragments = re.exec(str);
  if (fragments!=null)
     {var ol = seq();
      for (var i=3; i<p.length; i++)
          {var result = '"' + fragments[i-2] + '"';
           if (!vnifyp(p[i],al,result,al,ol))
              {backup(ol); return false}};
      traceexit(pluug(p,al,xl),cont);
      var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  tracefail(goal,cont);
  return false}

function debugsomesubmatches (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var str = pluug(p[1],al,al)
  str = str.substring(1,str.length-1);
  if (symbolp(str))
     {var re=new RegExp(p[2].substring(1,p[2].length-1),'g');
      var matches = str.match(re);
      if (matches!=null)
         {for (var i=0; i<matches.length; i++)
              {var result = '"' + matches[i] + '"';
               var ol = seq();
               if (vnifyp(p[3],al,result,al,ol))
                  {traceexit(pluug(p,al,xl),cont);
                   var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
                   backup(ol);
                   if (answer) {return answer};
                   traceredo(goal,cont)}}}};
  tracefail(goal,cont);
  return false}

function debugsomeeval (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var args = seq();
  for (var i=1; i<p.length; i++)
      {var arg = pluug(p[i],al,al);
       if (varp(arg)) {return false} else {args[args.length] = arg}};
  var val = eval(p[0]).apply(null,args);
  if (!val) {tracefail(goal,cont); return false};
  traceexit(goal,cont);
  return debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules)}

function debugsomecall (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var args = seq();
  for (var i=1; i<p.length-1; i++)
      {var arg = pluug(p[i],al,al);
       if (varp(arg)) {return false} else {args[args.length] = arg}};
  var val = eval(p[0]).apply(null,args);
  if (!val) {tracefail(goal,cont); return false};
  var ol = seq();
  if (vnifyp(p[p.length-1],al,val,al,ol))
     {traceexit(pluug(p,al,xl),cont);
      var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  tracefail(goal,cont);
  return false}

function debugsomemath (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var args = seq();
  for (var i=1; i<p.length-1; i++)
      {var arg = numberize(pluug(p[i],al,al));
       if (isNaN(arg)) {return false};
       args[args.length] = arg};
  var val = stringize(Math[p[0]].apply(null,args));
  var ol = seq();
  if (vnifyp(p[p.length-1],al,val,al,ol))
     {traceexit(pluug(p,al,xl),cont);
      var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);;
      backup(ol);
      return answer};
  tracefail(goal,cont);
  return false}

function debugsomelist (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var c = pluug(p[1],al,al);
  var s = numlistify(c);
  if (s===false) {return false};
  var val = stringize(eval(p[0]).call(null,s));
  var ol = seq();
  if (vnifyp(p[2],al,val,al,ol))
     {traceexit(pluug(p,al,xl),cont);
      var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);;
      backup(ol);
      return answer};
  tracefail(goal,cont);
  return false}

function debugsomemap (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  if (!symbolp(p[1]) || varp(p[1])) {return false};
  var val = map(p[1],pluug(p[2],al,al),facts,rules);
  if (val===false) {return false};
  var ol = seq();
  if (vnifyp(p[3],al,val,al,ol))
     {traceexit(pluug(p,al,xl),cont);
      var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  tracefail(goal,cont);
  return false}

function debugsomesetofall (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  p = pluug(p,al,al);
  var ol = seq();
  var result = listify(debugfinds(p[1],p[2],facts,rules));
  if (vnifyp(p[3],al,result,al,ol))
     {traceexit(pluug(p,al,xl),cont);
      var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  tracefail(goal,cont);
  return false}

function debugsomecountofall (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  p = pluug(p,al,al);
  var ol = seq();
  var result = compfinds(p[1],p[2],facts,rules).length.toString();
  if (vnifyp(p[3],al,result,al,ol))
     {traceexit(pluug(p,al,xl),cont);
      var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  tracefail(goal,cont);
  return false}

function debugsomeevaluate (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var val = compvalue(pluug(p[1],al,al),facts,rules);
  var ol = seq();
  if (val && vnifyp(p[2],al,val,al,ol))
     {traceexit(pluug(p,al,xl),cont);
      var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
      backup(ol);
      return answer};
  tracefail(goal,cont);
  return false}

function debugsomemember (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var item = p[1];
  var list = pluug(p[2],al,al);
  var ol = [];
  while (!symbolp(list) && list[0]==='cons')
   {if (vnifyp(item,al,list[1],al,ol))
       {traceexit(pluug(p,al,xl),cont);
        answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
        backup(ol);
        if (answer) {return answer};
        traceredo(goal,cont)};
    list = list[2]};
  tracefail(goal,cont);
  return false}

function debugsomenot (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  if (debugsome(1,x,xl,p[1],seq(),al,nil,[],facts,rules)===false)
     {traceexit(pluug(p,al,xl),cont);
      return debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules)};
  tracefail(goal,cont);
  return false}

function debugsomeand (n,x,xl,p,pl,al,cont,results,facts,rules)
 {return debugsomeexit(n,x,xl,p,concatenate(tail(p),pl),al,cont,results,facts,rules)}

function debugsomeor (n,x,xl,p,pl,al,cont,results,facts,rules)
 {for (var i=1; i<p.length; i++)
      {var answer = debugsome(n,x,xl,p[i],pl,al,cont,results,facts,rules);
       if (answer) {return answer}};
  return false}

function debugsometrue (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var ds = getdataset(p[2]);
  var data = envlookupfacts(p[1],al,ds);
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (vnifyp(data[i],bl,p[1],al,ol))
          {traceexit(data[i],cont);
           var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
           backup(ol);
           if (answer) {return answer};
           traceredo(goal,cont)}};
  tracefail(goal,cont);
  return false}

function debugsomebase (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var data = envlookupfacts(p,al,facts);
  for (var i=0; i<data.length; i++)
      {instantiations++;
       var bl = {};
       var ol = seq();
       if (vnifyp(data[i],bl,p,al,ol))
          {traceexit(data[i],cont);
           var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
           backup(ol);
           if (answer) {return answer};
           traceredo(goal,cont)}};
  tracefail(goal,cont);
  return false}

function debugsomeview (n,x,xl,p,pl,al,cont,results,facts,rules)
 {var goal = pluug(p,al,xl);
  tracecall(goal,cont);
  var data = lookuprules(p,rules);
  for (var i=0; i<data.length; i++)
      {var bl = {};
       var ol = seq();
       if (data[i][0]==='rule')
          {if (vnifyp(data[i][1],bl,p,al,ol))
              {var ql = data[i].slice(2);
               var nc = seq(p,pl,al,cont);
               var answer = debugsomeexit(n,x,xl,goal,ql,bl,nc,results,facts,rules);
               backup(ol);
               if (answer) {return answer}}}
       else {if (vnifyp(data[i],bl,p,al,ol))
                {traceexit(data[i],cont);
                 var answer = debugsomeexit(n,x,xl,goal,pl,al,cont,results,facts,rules);
                 backup(ol);
                 if (answer) {return answer};
                 traceredo(goal,cont)}}}
  tracefail(goal,cont);
  return false}

function debugsomegoals (n,x,xl,p,pl,al,cont,results,facts,rules)
 {traceexit(pluug(p,xl,xl),cont);
  var answer = debugsomeexit(n,x,xl,p,pl,al,cont,results,facts,rules);
  if (answer) {return answer};
  traceredo(p,cont);
  return false}

function debugsomeexit (n,x,xl,p,pl,al,cont,results,facts,rules)
 {if (pl.length!==0)
     {return debugsome(n,x,xl,pl[0],tail(pl),al,cont,results,facts,rules)};
  if (nullp(cont))
     {results.push(pluug(x,al,al));
      if (typeof(n)==='number' && results.length>=n) {return results};
      return false};
  return debugsomegoals(n,x,xl,cont[0],cont[1],cont[2],cont[3],results,facts,rules)}

//==============================================================================
// special relations and operators
//==============================================================================

var specials =  ['mutex','leq','symleq'];
// ['mutex','less','leq','greater','geq','symless','symleq','symgreater','symgeq'];

var builtins = 
 ["bitlsh","bitand","bitlsh","bitior","bitnot",
  "hastype","plus","minus","times","quotient","remainder",
  "symbolize","newsymbolize",
  "readstring","stringify","readstringall","stringifyall",
  "matches","submatches","stringappend","stringmin", "stringjoin",
  "timestamp","maketimestamp",
  "getyear","getmonth","getdate","gethour","getminute","getsecond",
  "append","reverse","revappend","length","listify","delistify"];

var listoperators = 
 ["maximum","minimum","range","midrange","sum","median","mean","variance","stddev"];

var aggregates = ["countofall", "setofall"];

function updateop (x) {return findq(x,["pos", "neg"])}
function specialp (x) {return findq(x,specials)}
function builtinp (x) {return findq(x,builtins)}
function mathp (x) {return (typeof Math[x]==='function')}
function listop (x) {return findq(x,listoperators)}
function aggregatep (x) {return findq(x,aggregates)}

//------------------------------------------------------------------------------

var datasets = {}

function putfact (p,d)
 {return savefact(p,getdataset(d))}

function remfact (p,d)
 {return dropfact(p,getdataset(d))}

function getdataset (id)
 {var dum = datasets[id];
  if (dum) {return dum};
  return seq()}

//------------------------------------------------------------------------------

function mutex ()
 {var exp=new Array(arguments.length);
  for (var i=0; i<arguments.length; i++) {exp[i]=arguments[i]};
  return mutexp(0,exp)}

function mutexp (n,l)
 {if (n>=l.length) {return true};
  for (var i=n+1; i<l.length; i++)
      {if (equalp(l[n],l[i])) {return false}};
  return mutexp(n+1,l)}

function leq (x,y)
 {return Number(x)<=Number(y)}

function less (x,y)
 {return Number(x)<Number(y)}

function symleq (x,y)
 {return x<=y}

function symless (x,y)
 {return x<y}

//------------------------------------------------------------------------------

function bitlsh (b,n)
 {if (isNaN(b)) {return false} else {b = BigInt(b)};
  if (isNaN(n)) {return false} else {n = BigInt(n)};
  return (b<<n).toString()}

function bitand (x,y)
 {if (isNaN(x)) {return false} else {x = BigInt(x)};
  if (isNaN(y)) {return false} else {y = BigInt(y)};
  return (x&y).toString()}

function bitior (x,y)
 {if (isNaN(x)) {return false} else {x = BigInt(x)};
  if (isNaN(y)) {return false} else {y = BigInt(y)};
  return (x|y).toString()}

function bitxor (x,y)
 {if (isNaN(x)) {return false} else {x = BigInt(x)};
  if (isNaN(y)) {return false} else {y = BigInt(y)};
  return (x^y).toString()}

function bitnot (x)
 {if (isNaN(x)) {return false} else {x = BigInt(x)};
  return (~x).toString()}

//------------------------------------------------------------------------------

function plus ()
 {var result = 0;
  for (var i=0; i<arguments.length; i++)
      {var arg = numberize(arguments[i]);
       if (isNaN(arg)) {return false};
       result = result + arg};
  return stringize(result)}

function minus ()
 {if (arguments.length===0) {return 0};
  var result = numberize(arguments[0]);
  for (var i=1; i<arguments.length; i++)
      {var arg = numberize(arguments[i]);
       if (isNaN(arg)) {return false};
       result = result - arg};
  return stringize(result)}

function times ()
 {var result = 1;
  for (var i=0; i<arguments.length; i++)
      {var arg = numberize(arguments[i]);
       if (isNaN(arg)) {return false};
       result = result * arg};
  return stringize(result)}

function quotient ()
 {var result = numberize(arguments[0]);
  for (var i=1; i<arguments.length; i++)
      {var arg = numberize(arguments[i]);
       if (isNaN(arg)) {return false};
       result = result / arg};
  return stringize(result)}

function remainder ()
 {var result = numberize(arguments[0]);
  for (var i=1; i<arguments.length; i++)
      {var arg = numberize(arguments[i]);
       if (isNaN(arg)) {return false};
       result = result % arg};
  return stringize(result)}

//------------------------------------------------------------------------------

function maximum (s)
 {return Math.max.apply(null,s)}

function minimum (s)
 {return Math.min.apply(null,s)}

function range (s)
 {return maximum(s)-minimum(s)}

function midrange (s)
 {return (maximum(s)+minimum(s))/2}

function sum (s) 
 {var num = 0;
  for (var i=0; i<s.length; i++) {num += s[i]};
  return num}

function median (s)
 {s.sort(function(a, b) {return a - b});
  var mid = s.length/2;
  return mid%1 ? s[mid-0.5] : (s[mid-1] + s[mid])/2}

function mean (s)
 {return sum(s)/s.length}

function variance (s)
 {var avg = mean(s);
  return mean(s.map(function(num) {return Math.pow(num-avg,2)}))}

function stddev (s)
 {return Math.sqrt(variance(s))}

//------------------------------------------------------------------------------

function hastype (x)
 {if (symbolp(x)) {return 'symbol'};
  return 'funterm'}

function numberize (s)
 {if (s==='blank') {return 0};
  if (s==='false') {return 0};
  if (s==='true') {return 1};
  if (s==='infinity') {return Infinity};
  if (s==='neginfinity') {return -Infinity};
  return parseFloat(s)}

function stringize (s)
 {if (s===Infinity) {return 'infinity'};
  if (s===-Infinity) {return 'neginfinity'};
  return s + ''}

function symbolize (s)
 {s = s.replace(/[^a-z0-9]/gi,'');
  return s.toLowerCase()}

function newsymbolize (s)
 {s = replacediacritics(s);
  s = s.replace(/ /gi,'_');
  s = s.replace(/[^a-z_0-9]/gi,'');
  return s.toLowerCase()}

function replacediacritics(s)
 {var s;
  var diacritics = [
        /[\300-\306]/g, /[\340-\346]/g,  // A, a
        /[\310-\313]/g, /[\350-\353]/g,  // E, e
        /[\314-\317]/g, /[\354-\357]/g,  // I, i
        /[\322-\330]/g, /[\362-\370]/g,  // O, o
        /[\331-\334]/g, /[\371-\374]/g,  // U, u
        /[\321]/g, /[\361]/g, // N, n
        /[\307]/g, /[\347]/g, // C, c
    ];
  var chars = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];
  for (var i = 0; i < diacritics.length; i++)
      {s = s.replace(diacritics[i],chars[i])};
  return s}

function stringmatchp (str,pat)
 {if (!stringp(str)) {return false};
  if (!stringp(pat)) {return false};
  str = str.slice(1,-1);
  pat = new RegExp(pat.slice(1,-1),'g');
  return pat.test(str)}

function matches (str,pat)
 {if (!stringp(str)) {return false};
  if (!stringp(pat)) {return false};
  str = str.slice(1,-1);
  pat = pat.slice(1,-1);
  var re=new RegExp(pat,'g');
  var fragments = re.exec(str);
  if (fragments!=null) {return quotelistify(fragments)};
  return false}

function submatches (str,pat)
 {if (!stringp(str)) {return false};
  if (!stringp(pat)) {return false};
  str = str.slice(1,-1);
  pat = pat.slice(1,-1);
  var re=new RegExp(pat,'g');
  var matches = str.match(re);     
  if (matches!=null)
     {var matches = str.match(re)
      return quotelistify(matches)};
  return false}

function quotelistify (s)
 {var exp = nil;
  for (var i=s.length-1; i>=0; i--)
      {exp = seq('cons',quotify(s[i]),exp)};
  return exp}

function stringappend ()
 {var exp='';
  for (var i=0; i<arguments.length; i++) {exp += stripquotes(arguments[i])};
  return '"' + exp + '"'}

function stringify (x)
 {return '"' + grind(x) + '"'}

function stringifyall (x)
 {return '"' + stringifyallexp(x) + '"'}

function stringifyallexp (x)
 {if (x===nil) {return ''};
  if (symbolp(x)) {return ''};
  if (x[0]==='cons')
     {return grind(x[1]) + '\n' + stringifyallexp(x[2])};
  return ''}

function readstring (x)
 {return read(stripquotes(x))}

function readstringall (x)
 {return listify(readdata(stripquotes(x)))}

function stripquotes (x)
 {if (x[0]==='"' && x[x.length-1]==='"') {return x.slice(1,-1)};
  return x}

function quotify (x)
 {return ('"' + x + '"')}

function stringmin (x,y)
 {if (y<x) {return y} else {return x}}

//------------------------------------------------------------------------------

function stringjoin (c)
 {var s = seq();
  while (true)
   {if (c===nil) {return '"' + s + '"'};
    if (symbolp(c)) {return false};
    if (c[0]!=='cons') {return false};
    s = s + stripquotes(c[1]);
    if (c[2]!==nil) {s = s + " "};
    c = c[2]};
  return false}

//------------------------------------------------------------------------------

function listp (x)
 {if (x===nil) {return true};
  if (symbolp(x)) {return false};
  if (x[0]==='cons') {return listp(x[2])};
  return false}

function append (l1,l2)
 {if (nullp(l1)) {return l2};
  if (symbolp(l1)) {return false};
  if (l1[0]!=='cons') {return false};
  return seq('cons',l1[1],append(l1[2],l2))}

function reverse (l)
 {return revappend(l,nil)}

function revappend (l,m)
 {if (l===nil) {return m};
  if (symbolp(l)) {return false};
  if (l[0]!=='cons') {return false};
  return revappend(l[2],seq('cons',l[1],m))}

function length (l)
 {return stringize(getlength(l))}

function getlength (l)
 {if (l===nil) {return 0};
  if (symbolp(l)) {return false};
  if (l[0]!=='cons') {return false};
  return getlength(l[2])+1}

function map (f,l,facts,rules)
 {if (l===nil) {return nil};
  if (symbolp(l) || l[0]!=='cons') {return false};
  var result = compfindx('Y',seq(f,l[1],'Y'),facts,rules);
  if (result===false) {return false};
  var results = map(f,l[2],facts,rules);
  if (results===false) {return false};
  return seq('cons',result,results)}

function listify (s)
 {var exp = nil;
  for (var i=s.length-1; i>=0; i--)
      {exp = seq('cons',s[i],exp)};
  return exp}

function numlistify (c)
 {var s = seq();
  while (true)
   {if (c===nil) {return s};
    if (symbolp(c)) {return false};
    if (c[0]!=='cons') {return false};
    var arg = numberize(c[1]);
    if (isNaN(arg)) {return false};
    s[s.length] = arg;
    c = c[2]};
  return false}

function delistify (c)
 {var s = seq();
  while (true)
   {if (c===nil) {return s};
    if (symbolp(c)) {return false};
    if (c[0]!=='cons') {return false};
    s[s.length] = c[1];
    c = c[2]};
  return false}

//------------------------------------------------------------------------------

function timestamp ()
 {return stringize(Date.now())}

function maketimestamp (y,m,d,h,n,s)
 {var y = numberize(y);
  var m = numberize(m-1);
  var d = numberize(d);
  var h = numberize(h);
  var n = numberize(n);
  var s = numberize(s);
  return stringize(new Date(y,m,d,h,n,s).getTime())}

function getyear (stamp)
 {return stringize(new Date(numberize(stamp)).getFullYear())}

function getmonth (stamp)
 {return stringize(new Date(numberize(stamp)).getMonth()+1)}

function getdate (stamp)
 {return stringize(new Date(numberize(stamp)).getDate())}

function gethour (stamp)
 {return stringize(new Date(numberize(stamp)).getHours())}

function getminute (stamp)
 {return stringize(new Date(numberize(stamp)).getMinutes())}

function getsecond (stamp)
 {return stringize(new Date(numberize(stamp)).getSeconds())}

//==============================================================================
// reading
//==============================================================================

function read (str)
 {try {return fastread(str)} catch (err) {return 'error'}}

function readdata (str)
 {try {return fastreaddata(str)} catch (err) {return seq()}}

function readitems (str)
 {try {return fastreaditems(str)} catch (err) {return seq()}}

function fastread (str)
 {return parse(scan(str))}

function fastreaddata (str)
 {return parsedata(scan(str))}

function fastreaditems (str)
 {return parseitems(scan(str))}

//------------------------------------------------------------------------------

var input = '';
var output = '';
var current = 0;

function scan (str)
 {input = str;
  output = new Array(0);
  var cur = 0;
  var len = input.length;
  while (cur < len)
   {var charcode = input.charCodeAt(cur);
    if (charcode<=32) {cur++}
    else if (charcode===33) {output[output.length] = '!'; cur++}
    else if (charcode===34) {cur = scanstring(cur)}
    else if (charcode===35) {output[output.length] = '#'; cur++}
    else if (charcode===37) {cur = scancomment(cur)}
    else if (charcode===38) {output[output.length] = '&'; cur++}
    else if (charcode===40) {output[output.length] = 'lparen'; cur++}
    else if (charcode===41) {output[output.length] = 'rparen'; cur++}
    else if (charcode===42) {output[output.length] = '*'; cur++}
    else if (charcode===43) {output[output.length] = '+'; cur++}
    else if (charcode===44) {output[output.length] = 'comma'; cur++}
    else if (charcode===45) {output[output.length] = '-'; cur++}
    else if (charcode===58) {cur = scanrulesym(cur)}
    else if (charcode===61) {cur = scanthussym(cur)}
    else if (charcode===91) {output[output.length] = '['; cur++}
    else if (charcode===93) {output[output.length] = ']'; cur++}
    else if (charcode===95) {output[output.length] = '_'; cur++}
    else if (charcode===124) {output[output.length] = '|'; cur++}
    else if (charcode===126) {output[output.length] = '~'; cur++}
    else if (idcharp(charcode)) {cur = scansymbol(cur)}
    else {throw 'error'}};
  return output}

function scanrulesym (cur)
 {if (input.length<=cur+1) {throw 'error'};
  if (input.charCodeAt(cur+1)===45)
     {output[output.length] = ':-'; return cur+2};
  if (input.charCodeAt(cur+1)===58)
     {output[output.length] = '::'; return cur+2};
  if (input.charCodeAt(cur+1)===61)
     {output[output.length] = ':='; return cur+2};   
  throw 'error'}

function scanthussym (cur)
 {if (input.length>cur+2 && input.charCodeAt(cur+1)===61
                         && input.charCodeAt(cur+2)===62)
     {output[output.length] = '==>'; return cur+3};
  throw 'error'}

function scansymbol (cur)
 {var n = input.length;
  var exp = '';
  while (cur < n)
   {if (idcharp(input.charCodeAt(cur))) {exp = exp + input.charAt(cur); cur++}
    else break};
  if (exp!=='') {output[output.length] = exp};
  return cur}

function scanstring (cur)
 {var exp = '"';
  cur++;
  while (cur < input.length)
   {exp = exp + input.charAt(cur);
    if (input.charCodeAt(cur)===34) {cur++; break};
    cur++};
  output[output.length] = exp;
  return cur}

function scancomment (cur)
 {while (cur<input.length &&
         input.charCodeAt(cur)!==10 && input.charCodeAt(cur)!==13)
   {cur++};
  return cur}

function letterp (charcode)
 {return ((charcode >= 65 && charcode <= 90) ||
          (charcode >= 97 && charcode <= 122))}

function digitp (charcode)
 {return (charcode >= 48 && charcode <= 57)}

function idcharp (charcode)
 {if (charcode===42) {return true};
  if (charcode===43) {return true};
  if (charcode===45) {return true};
  if (charcode===46) {return true};
  if (charcode===47) {return true};
  if (charcode >= 48 && charcode <= 57) {return true};
  if (charcode >= 65 && charcode <= 90) {return true};
  if (charcode >= 97 && charcode <= 122) {return true};
  if (charcode===95) {return true};
  return false}

//------------------------------------------------------------------------------

function parse (str)
 {input = str;
  current = 0;
  return parsexp('lparen','rparen')}

function parsedata (str)
 {input = str;
  current = 0;
  var exp = seq();
  while (current<input.length)
   {if (input[current]=='.') {current++}
       else {exp[exp.length] = parsexp('lparen','rparen')}};
  return exp}

function parseitems (str)
 {input = str;
  current = 0;
  var exp = seq();
  while (current<input.length)
   {if (input[current]==='comma') {current++};
    exp[exp.length] = parsexp('lparen','rparen')};
  return exp}

function parsexp (lop,rop)
 {if (current>=input.length) {throw 'error'};
  var left = parseprefix(rop);
  while (current<input.length)
   {if (input[current]==='lparen') {left = parseatom(left)}
    else if (!find(input[current],infixes)) {return left}
    else if (precedencep(lop,input[current])) {return left}
    else {left = parseinfix(left,input[current],rop)}};
  return left}


function parseatom (left)
 {current++;
  var exp = seq(left);
  if (input[current]==='rparen') {current++; return exp};
  while (current<input.length)
   {exp.push(parsexp('comma','rparen'));
    if (input[current]==='rparen') {current++; return exp}
    else if (input[current]==='comma') {current++}
    else {throw 'error'}};
  return exp}


function parseprefix (rop)
 {var left = input[current];
  if (left==='+') {return parseplus(rop)};
  if (left==='-') {return parseminus(rop)};
  if (left==='*') {return parsestar(rop)};
  if (left==='~') {return parsenegation(rop)};
  if (left==='[') {return parselist()};
  if (left==='lparen') {return parseparenexp()};
  if (left==='_') {current++; counter++; return '_' + counter};
  if (identifierp(left)) {current++; return left};
  throw 'error'}

function parseplus (rop)
 {current++;
  return seq('insert',parsexp('~',rop))}

function parseminus (rop)
 {current++;
  var arg = parsexp('~',rop);
  if (isNaN(arg)) {return seq('delete',arg)};
  return (-parseInt(arg)).toString()}

function parsestar (rop)
 {current++;
  return seq('enqueue',parsexp('~',rop))}

function parsenegation (rop)
 {current++;
  return makenegation(parsexp('~',rop))}

function parselist ()
 {current++;
  if (input[current]===']') {current++; return nil};
  var head = parsexp('comma','comma');
  return seq('cons',head,parselistexp())}

function parselistexp ()
 {if (input[current]===']') {current++; return nil};
  if (input[current]==='comma')  
     {current++;
      return seq('cons',parsexp('comma','comma'),parselistexp())};
  throw 'error'}

function parseparenexp ()
 {current++;
  var left = parsexp('lparen','rparen');
  current++;
  return left}


function parseinfix (left,op,rop)
 {if (op==='!') {return parsecons(left,rop)};
  if (op==='&') {return parseand(left,rop)};
  if (op==='|') {return parseor(left,rop)};
  if (op==='==>') {return parsetransition(left,rop)};
  if (op===':=') {return parsedefinition(left,rop)};
  if (op===':-') {return parserule(left,rop)};
  if (op==='::') {return parsehandler(left,rop)};
  throw 'error'}

function parsecons (left,rop)
 {current++;
  return seq('cons',left,parsexp('!',rop))}

function parseand (left,rop)
 {current++;
  var right = parsexp('&',rop);
  var result;
  if (symbolp(left) || left[0]!=='and') {result = seq('and',left)}
     else {result = left};
  if (symbolp(right) || right[0]!=='and') {result.push(right)}
     else {result = result.concat(right.slice(1))}  
  return result}

function parseor (left,rop)
 {current++;
  var right = parsexp('|',rop);
  var result;
  if (symbolp(left) || left[0]!=='or') {result = seq('or',left)}
     else {result = left};
  if (symbolp(right) || right[0]!=='or') {result.push(right)}
     else {result = result.concat(right.slice(1))}  
  return result}

function parsedefinition (left,rop)
 {current++;
  return makedefinition(left,parsexp(':=',rop))}

function parserule (left,rop)
 {current++;
  return makerule(left,parsexp(':-',rop))}

function parsetransition (left,rop)
 {current++;
  return maketransition(left,parsexp('==>',rop))}

function parsehandler (left,rop)
 {current++;
  return makehandler(left,parsexp('::',rop))}

function makehandler (head,body)
 {return seq('handler',head,body)}


var infixes = ['!','&','|','==>',':=',':-','::']

var tokens = ['!','#','~','&','|','==>',':=',':-','::','[',']','lparen','rparen','comma','.']

function identifierp (x) {return !find(x,tokens)}

var precedence = ['!','#','~','&','|','==>',':=',':-','::']

function precedencep (lop,rop)
 {for (var i=0; i<precedence.length;i++)
      {if (precedence[i]===rop) {return false};
       if (precedence[i]===lop) {return true}};
  return false}

function parenp (lop,op,rop)
 {return precedencep(lop,op) || !precedencep(op,rop)}

//------------------------------------------------------------------------------
// readkifdata
// readkif
//------------------------------------------------------------------------------

function readkifdata (str)
 {return kifdata(kifscan(str))}

function readkif (str)
 {return kif(kifscan(str))}

function kifscan (str)
 {input = str;
  output = new Array(0);
  var cur = 0;
  var len = input.length;
  while (cur < len)
   {var charcode = input.charCodeAt(cur);
    if (charcode===32 || charcode===13) {cur++}
    else if (charcode===34) {cur = scanstring(cur)}
    else if (charcode===40) {output[output.length] = 'lparen'; cur++}
    else if (charcode===41) {output[output.length] = 'rparen'; cur++}
    else if (charcode===59) {cur = kifscancomment(cur)}
    else if (charcode===63) {cur = kifscanvariable(cur)}
    else if (kifidcharp(charcode)) {cur = kifscansymbol(cur)}
    else cur++};
  return output}

function kifscansymbol (cur)
 {var exp = '';
  while (cur < input.length)
   {if (kifidcharp(input.charCodeAt(cur))) {exp = exp + input[cur]; cur++}
    else break};
  if (exp!=='') {output[output.length] = exp};
  return cur}

function kifscanvariable (cur)
 {cur++;
  var exp = '';
  if (letterp(input.charCodeAt(cur)))
     {exp=input.slice(cur,cur+1).toUpperCase(); cur++}
     else {exp = 'VV'};
  while (cur < input.length)
   {if (kifidcharp(input.charCodeAt(cur))) {exp = exp + input[cur]; cur++}
    else break};
  if (exp!=='') {output[output.length] = exp};
  return cur}

function kifscanstring (cur)
 {var exp = '';
  cur++
  while (cur < input.length && input.charCodeAt(cur)!==34)
        {exp = exp + input[cur]; cur++};
  cur++;
  output[output.length] = exp
  return cur}

function kifscancomment (cur)
 {while (cur < input.length && input.charCodeAt(cur)!==10 && input.charCodeAt(cur)!==13) {cur++};
  return cur}

function kifidcharp (charcode)
 {if (charcode===45) {return true};
  if (charcode===46) {return true};
  if (charcode===60) {return true};
  if (charcode===61) {return true};
  if (charcode >= 48 && charcode <= 57) {return true};
  if (charcode >= 65 && charcode <= 90) {return true};
  if (charcode >= 97 && charcode <= 122) {return true};
  if (charcode===95) {return true};
  return false}

function kifdata (str)
 {str.push('eof');
  input = str;
  current = 0;
  exp = new Array(0);
  while (current < input.length && input[current]!=='eof')
   {exp[exp.length] = kifexp()};
  return exp}

function kif (str)
 {str.push('eof');
  input = str;
  current = 0;
  return kifexp()}

function kifexp ()
 {var lexeme = input[current];
  if (lexeme==='eof') {return nil};
  if (lexeme==='<=') {current++; return 'rule'};
  if (lexeme==='lparen') {return kifparenlist()};
  current++; return lexeme}

function kifparenlist ()
 {var exp = new Array(0);
  current++;
  if (input[current]==='rparen') {current++; return exp};
  while (current < input.length)
   {exp.push(kifexp());
    if (input[current]==='rparen') {current++; return exp}};
  return exp}

//==============================================================================
// writing
//==============================================================================

function printseq (p)
 {if (p===true) {return 'true'};
  if (p===false) {return 'false'};
  if (typeof p==='number') {return p};
  if (typeof p==='string') {return '"' + p + '"'};
  var n = p.length;
  var exp = '(';
  if (n>0) {exp += printseq(p[0])};
  for (var i=1; i<n; i++)
      {exp = exp + ' ' + printseq(p[i])}
  exp += ')';
  return exp}

function printspaces (n)
 {var exp = '';
  for (var i=0; i<n; i++) {exp += '  '};
  return exp}

//------------------------------------------------------------------------------

function printdata (data)
 {var exp = '';
  var n = data.length;
  for (var i=0; i<n; i++)
      {exp = exp + printit(data[i]) + '<br/>'}
  return exp}

function printem (data)
 {var exp = '';
  var n = data.length;
  for (var i=0; i<n; i++)
      {exp = exp + printit(data[i]) + '\r'}
  return exp}

function printit (p)
 {if (p==='rule') {return '<='};
  if (p===null) {return ''};
  if (varp(p)) {return '?' + p};
  if (symbolp(p)) {return p};
  var n = p.length;
  var exp = '(';
  if (n>0) {exp += printit(p[0])};
  for (var i=1; i<n; i++)
      {exp = exp + ' ' + printit(p[i])}
  exp += ')';
  return exp}

//------------------------------------------------------------------------------

function doxml ()
 {var win = window.open();
  //win.document.open('text/html');
  win.document.writeln('&lt;?xml version="1.0"?&gt;<br/>\n');
  win.document.writeln('&lt;?xml-stylesheet type="text/xsl" href="../stylesheets/proof.xsl"?&gt;<br/>\n');
  win.document.write(xmlproof());
  win.document.close()}

function xmlproof ()
 {var exp = '';
  exp += '&lt;proof&gt;<br/>\n';
  for (var i=1; i<proof.length; i++)
      {exp += '  &lt;step&gt;<br/>';
       exp += '    &lt;number&gt;' + i + '&lt;/number&gt;<br/>\n';
       exp += '    &lt;sentence&gt;' + grind(proof[i][1]) + '&lt;/sentence&gt;<br/>\n';
       exp += '    &lt;justification&gt;' + prettify(proof[i][2]) + '&lt;/justification&gt;<br/>\n';
       for (var j=3; j<proof[i].length; j++)
           {exp += '    &lt;antecedent&gt;' + proof[i][j] + '&lt;/antecedent&gt;<br/>\n'};
       exp += '  &lt;/step&gt;<br/>\n'};
  exp += '&lt;/proof&gt;<br/>\n';
  return exp}

function xmlify (str)
 {str = str.replace('&','&amp;');
  str = str.replace('<=>','&lt;=&gt;');
  return str}

//------------------------------------------------------------------------------

function smoothdata (data)
 {var exp = '';
  var n = data.length;
  for (var i=0; i<n; i++)
      {exp = exp + smooth(data[i]) + '<br/>'}
  return exp}

function smooth (p)
 {if (symbolp(p)) {return p};
  var exp = p[0] + '(';
  if (p.length > 1) {exp += smooth(p[1])};
  for (var i=2; i<p.length; i++)
      {exp += ',' + smooth(p[i])}
  exp += ')';
  return exp}

//------------------------------------------------------------------------------

function grindproof (proof)
 {var exp = '';
  exp = exp + '<table cellpadding="4" cellspacing="0" border="1">';
  exp = exp + '<tr bgcolor="#bbbbbb">';
  exp = exp + '<td>&nbsp;</td>'; //exp = exp + '<td><input type="checkbox" name="Selection"/></td>';
  exp = exp + '<th>Step</th><th>Proof</th><th>Justification</th>';
  exp = exp + '</tr>';
  for (var i=0; i<proof.length; i=i+3)
      {exp = exp + '<tr id="0">';
       exp = exp + '<td bgcolor="#eeeeee"><input id="' + (i/3 + 1) + '" type="checkbox"/></td>';
       exp = exp + '<td align="center" bgcolor="#eeeeee">' + (i/3 + 1) + '</td>';
       exp = exp + '<td>' + grind(proof[i+1]) + '</td>';
       exp = exp + '<td bgcolor="#eeeeee">' + proof[i+2] + '</td>';
       exp = exp + '</tr>'};  
       exp = exp + '</table>';
  return exp}

//------------------------------------------------------------------------------

function grinddata (data)
 {var exp = '';
  var n = data.length;
  for (var i=0; i<n; i++)
      {exp = exp + grind(data[i]) + '<br/>'}
  return exp}

function grindem (data)
 {var exp = '';
  var n = data.length;
  for (var i=0; i<n; i++)
      {exp = exp + grind(data[i]) + '\n'}
  return exp}

function grindall (data)
 {var exp = '';
  var n = data.length;
  for (var i=0; i<n; i++)
      {exp = exp + grind(data[i]) + ' '}
  return exp}

function grind (p)
 {return grindit(p,'lparen','rparen')}

function grindit (p,lop,rop)
 {if (p==='nil') {return '[]'};
  if (typeof(p)==='string' && p.length!==0 && p[0]==='_') {return '_'};
  if (symbolp(p)) {return p};
  if (p[0]==='cons') {return grindcons(p,lop,rop)}
  if (p[0]==='insert') {return grindinsertion(p,rop)};
  if (p[0]==='delete') {return grinddeletion(p,rop)};
  if (p[0]==='enqueue') {return grindenqueue(p,rop)};
  if (p[0]==='not') {return grindnegation(p,rop)};
  if (p[0]==='and') {return grindand(p,lop,rop)};
  if (p[0]==='or') {return grindor(p,lop,rop)};
  if (p[0]==='transition') {return grindtransition(p,lop,rop)};
  if (p[0]==='definition') {return grinddefinition(p,lop,rop)};
  if (p[0]==='rule') {return grindrule(p,lop,rop)};
  if (p[0]==='handler') {return grindhandler(p,lop,rop)};
  return grindatom(p)}

function grindcons (p,lop,rop)
 {if (listp(p)) {return grindlist(p)};
  var exp = '';
  var parens = parenp(lop,'!',rop);
  if (parens) {lop = 'lparen'; rop = 'rparen'};
  if (parens) {exp = '('};
  exp = exp + grindit(p[1],lop,'!') + '!' + grindit(p[2],'!',rop);
  if (parens) {exp = exp + ')'};
  return exp}

function grindlist (p)
 {var out = '[' + grind(p[1]);
  p = p[2];
  while (!symbolp(p) && p[0]==='cons')
   {out = out + ',' + grind(p[1]); p = p[2]};
  if (p!=='nil') {out = out + '|' + grind(p)};
  out = out + ']';
  return out}

function grindatom (p)
 {var n = p.length;
  var exp = p[0] + '(';
  if (n>1) {exp += grind(p[1])};
  for (var i=2; i<n; i++)
      {exp = exp + ',' + grind(p[i])}
  exp += ')';
  return exp}

function grindinsertion (p,rop)
 {return '+' + grindit(p[1],'~',rop)}

function grinddeletion (p,rop)
 {return '-' + grindit(p[1],'~',rop)}

function grindenqueue (p,rop)
 {return '*' + grindit(p[1],'~',rop)}

function grindnegation (p,rop)
 {return '~' + grindit(p[1],'~',rop)}

function grindand (p,lop,rop)
 {var exp = '';
  if (p.length == 1) {return 'false'};
  if (p.length == 2) {return grind(p[1],lop,rop)};
  var parens = parenp(lop,'&',rop);
  if (parens) {lop = 'lparen'; rop = 'rparen'};
  if (parens) {exp = '('};
  exp = exp + grindit(p[1],lop,'&');
  for (var i=2; i<p.length-1; i++)
      {exp = exp + ' & ' + grindit(p[i],'&','&')};
  exp = exp + ' & ' + grindit(p[p.length-1],'&',rop);
  if (parens) {exp = exp + ')'};
  return exp}

function grindor (p,lop,rop)
 {var exp = '';
  if (p.length == 1) {return 'false'};
  if (p.length == 2) {return grind(p[1],lop,rop)};
  var parens = parenp(lop,'|',rop);
  if (parens) {lop = 'lparen'; rop = 'rparen'};
  if (parens) {exp = '('};
  exp = exp + grindit(p[1],lop,'|');
  for (var i=2; i<p.length-1; i++)
      {exp = exp + ' | ' + grindit(p[i],'|','|')};
  exp = exp + ' | ' + grindit(p[p.length-1],'|',rop);
  if (parens) {exp = exp + ')'};
  return exp}

function grindtransition (p,lop,rop)
 {var exp = '';
  var parens = parenp(lop,'==>',rop);
  if (parens) {lop = 'lparen'; rop = 'rparen'};
  if (parens) {exp = '('};
  exp = exp + grindit(p[1],lop,'==>') + ' ==> ' + grindit(p[2],'==>',rop);
  if (parens) {exp = exp + ')'};
  return exp}

function grinddefinition (p,lop,rop)
 {var exp = '';
  var parens = parenp(lop,':=',rop);
  if (parens) {lop = 'lparen'; rop = 'rparen'};
  if (parens) {exp = '('};
  exp = exp + grindit(p[1],lop,':=') + ' := ' + grindit(p[2],':=',rop);
  if (parens) {exp = exp + ')'};
  return exp}

function grindrule (p,lop,rop)
 {var exp = grind(p[1]) + ' :- ';
  if (p.length===2) {exp += 'true'}
  else if (p.length===3) {exp += grindit(p[2],':-',rop)}
  else {exp += grindit(p[2],lop,'&');
        for (var i=3; i<p.length-1; i++)
            {exp = exp + ' & ' + grindit(p[i],'&','&')};
        exp += ' & ' + grindit(p[p.length-1],'&',rop)};
  return exp}

function grindhandler (p,lop,rop)
 {var exp = '';
  var parens = parenp(lop,'::',rop);
  if (parens) {lop = 'lparen'; rop = 'rparen'};
  if (parens) {exp = '('};
  exp = exp + grindit(p[1],lop,'::') + ' :: ' + grindit(p[2],'::',rop);
  if (parens) {exp = exp + ')'};
  return exp}

function grindalist (al)
 {var exp = '';
  if (al===false) {return 'false'};
  for (var l=al; !nullp(l); l=cdr(l))
      {exp = exp + car(car(l)) + ' = ' + grind(cdr(car(l))) + '<br/>'}
  return exp}

//------------------------------------------------------------------------------

function displayrules (rules)
 {exp = '';
  for (var i=0; i<rules.length; i++)
      {exp += displayrule(rules[i]) + '\n'};
  return exp}

function displayrule (p)
 {if (symbolp(p)) {return p};
  if (p[0]==='rule') {return disprule(p)};
  if (p[0]==='transition') {return disptransition(p)};
  if (p[0]==='handler') {return disphandler(p)};
  return grindatom(p)}

function disprule (p)
 {if (p.length==2) {return grind(p[1]) + ' :- true\n'};
  if (p.length==3) {return grind(p[1]) + ' :- ' + grind(p[2]) + '\n'};
  var exp = grind(p[1]) + ' :-\n';
  for (var i=2; i<p.length-1; i++)
      {exp = exp + '  ' + grindit(p[i],'&','&') + ' &\n'};
  exp +=  '  ' + grindit(p[p.length-1],'&','&') + '\n';
  return exp}

function disptransition (p)
 {if (p.length<2) {return ''};
  if (symbolp(p[2]) || p[2][0]!=='and')
     {return grind(p[1]) + ' ==> ' + grind(p[2]) + '\n'};
  if (p[2].length<4)
     {return grind(p[1]) + ' ==>\n  ' + grind(p[2]) + '\n'};
  var exp = grind(p[1]) + ' ==>\n';
  for (var i=1; i<p[2].length-1; i++)
      {exp = exp + '  ' + grind(p[2][i]) + ' &\n'};
  exp +=  '  ' + grind(p[2][p.length-1]) + '\n';
  return exp}

function disphandler (p)
 {return grind(p[1]) + ' :: ' + grind(p[2]) + '\n'}

//------------------------------------------------------------------------------

function displayproof (proof)
 {var exp = '';
  exp = exp + '<table cellpadding="4" cellspacing="0" border="1">';
  exp = exp + '<tr bgcolor="#bbbbbb">';
  exp = exp + '<td><input type="checkbox" onClick="doselectall()"/></td>';
  exp = exp + '<th>Step</th><th>Proof</th><th>Justification</th>';
  exp = exp + '</tr>';
  for (var i=1; i<proof.length; i++)
      {exp = exp + '<tr id="0">';
       exp = exp + '<td bgcolor="#eeeeee"><input id="' + i +
                   '" type="checkbox"/></td>';
       exp = exp + '<td align="center" bgcolor="#eeeeee">' + i + '</td>';
       exp = exp + '<td>' + grind(proof[i][1]) + '</td>';
       exp += '<td bgcolor="#eeeeee">';
       exp += prettify(proof[i][2]);
       if (proof[i].length > 3)
          {exp += ': ' + proof[i][3];
           for (var j=4; j<proof[i].length; j++) {exp += ', ' + proof[i][j]}};
       exp += '</td>';
       exp = exp + '</tr>'};  
       exp = exp + '</table>';
  return exp}

function prettify (str)
 {return str.replace('_',' ')}

//------------------------------------------------------------------------------
// morefacts
// morerules
// loadfacts
// loadrules
// dumpfacts
// dumprules
//------------------------------------------------------------------------------

function morefacts (filename,target)
 {var contents = fs.readFileSync(filename).toString();
  var data = readdata(contents);
  definemorefacts(target,data);
  return true}

function morerules (filename,target)
 {var contents = fs.readFileSync(filename).toString();
  var data = readdata(contents);
  definemorerules(target,data);
  return true}

function loadfacts (filename,target)
 {var contents = fs.readFileSync(filename).toString();
  var data = readdata(contents);
  emptytheory(target);
  definemorefacts(target,data);
  return true}

function loadrules (filename,target)
 {var contents = fs.readFileSync(filename).toString();
  var data = readdata(contents);
  emptytheory(target);
  definemorerules(target,data);
  return true}

function dumpfacts (source,filename)
 {fs.writeFileSync(filename,showfacts(source));
  return true}

function showfacts (source)
 {var bases = getbases(source);
  var output = '';
  for (var i=0; i<bases.length; i++)
      {var facts = sentences(bases[i],source);
       for (j=0; j<facts.length; j++)
           {output += grind(facts[j]) + '\n'};
       output += '\n'};
  return output}

function dumprules (source,filename)
 {fs.writeFileSync(filename,showrules(source));
  return true}

function showrules (source)
 {var views = getviews(source);
  var output = '';
  for (var i=0; i<views.length; i++)
      {var rules = sentences(views[i],source);
       for (j=0; j<rules.length; j++)
           {output += grind(rules[j]) + '\n'};
       output += '\n'};
  return output}

//==============================================================================
// Error checking
//==============================================================================

function finderrors (data)
 {var errors = findarityerrors(data);
  errors = errors.concat(findsafetyerrors(data));
  errors = errors.concat(findstratificationerrors(data));
  return errors}

//------------------------------------------------------------------------------

function findarityerrors (data)
 {arities = seq();
  for (var i=0; i<data.length; i++)
      {arities = getarities(data[i],arities)};
  var errors = seq();
  for (rel in arities)
      {if (arities[rel]==='mixed')
          {errors[errors.length] = 'Mixed arity: ' + grind(rel)}};
  return errors}

function getarities (p,arities)
 {if (symbolp(p)) {return addarity(p,0,arities)}
  if (findq(p[0],aggregates))
     {return getarities(p[2],arities)};
  if (p[0]==='not') {return getarities(p[1],arities)};
  if (p[0]==='and' || p[0]==='or' || p[0]==='rule')
     {for (var i=1; i<p.length; i++)
          {arities = getarities(p[i],arities)};
      return arities};
  return addarity(p[0],p.length-1,arities)}

function addarity (x,n,arities)
 {if (arities[x]==null) {arities[x] = n; return arities};
  if (arities[x]===n) {return arities};
  arities[x] = 'mixed';
  return arities}

//------------------------------------------------------------------------------

function findsafetyerrors (data)
 {var errors = seq();
  for (var i=0; i<data.length; i++)
      {if (!safep(data[i]))
          {errors[errors.length] = 'Unsafe rule: ' + grind(data[i])}};
  return errors}

function safep (exp)
 {if (symbolp(exp)) {return true};
  if (exp[0]==='rule') {return saferulep(exp)};
  if (exp[0]==='transition') {return safetransitionp(exp)};
  return groundp(exp)}

function groundp (exp)
 {if (varp(exp)) {return false};
  if (symbolp(exp)) {return true};
  for (var i=0; i<exp.length; i++)
      {if (!groundp(exp[i])) {return false}};
  return true}

function saferulep (rule)
 {var vs = seq();
  for (var i=2; i<rule.length; i++)
      {vs = safegoalp(rule[i],vs)
       if (vs===false) {return false}};
  return safeheadp(rule[1],vs)}

function safetransitionp (transition)
 {var vs = seq();
  for (var i=1; i<transition.length-1; i++)
      {vs = safegoalp(transition[i],vs)
       if (vs===false) {return false}};
  return safeheadp(transition[2],vs)}

function safegoalp (exp,vs)
 {if (symbolp(exp)) {return vs};
  if (exp[0]==='distinct')
     {if (groundedp(exp,vs)) {return vs} else {return false}};
  if (findq(exp[0],builtins))
     {for (var i=1; i<exp.length-1; i++)
          {if (!groundedp(exp[i],vs)) {return false}};
      return varsexp(exp[exp.length-1],vs)};
  if (find(exp[0],aggregates))
     {if (!groundedp(exp[1],vars(exp[2]))) {return false};
      if (!safegoalp(exp[2],seq())) {return false};
      //if (!safegoalp(exp[2],vs.concat(vars(exp[1])))) {return false};
      return varsexp(exp[3],vs)};
  if (exp[0]==='not')
     {if (groundedp(exp[1],vs)) {return vs} else {return false}};
  if (exp[0]==='and')
     {for (var i=1; i<exp.length; i++)
          {vs = safegoalp(exp[i],vs)
           if (vs===false) {return false}}
      return vs};
  return varsexp(exp,vs)}

function safeheadp (exp,vs)
 {var hs = vars(exp);
  for (var i=0; i<hs.length; i++)
      {if (!findq(hs[i],vs)) {return false}};
  return true}

function groundedp (exp,vs)
 {if (varp(exp)) {return find(exp,vs)};
  if (symbolp(exp)) {return true};
  for (var i=0; i<exp.length; i++)
      {if (!groundedp(exp[i],vs)) {return false}};
  return true}

function operator (p)
 {if (symbolp(p)) {return p};
  if (p[0]==='not' || p[0]==='rule' || p[0]==='definition' || p[0]==='handler')
     {return operator(p[1])};
  return p[0]}

function operands (p)
 {if (symbolp(p)) {return seq()};
  if (p[0]==='not' || p[0]==='rule' || p[0]==='definition' || p[0]==='handler')
     {return operands(p[1])};
  return p.slice(1)}

//------------------------------------------------------------------------------

function findstratificationerrors (data)
 {var strata = getstrata(data);
  var errors = seq();
  for (var i=0; i<data.length; i++)
      {if (!checkstratifiedrecursion(data[i],strata))
          {errors[errors.length] = 'Unstratified Recursion: ' + grind(data[i])}};
  for (var i=0; i<data.length; i++)
      {if (!checkstratifiednegation(data[i],strata))
          {errors[errors.length] = 'Unstratified Negation: ' + grind(data[i])}};
  return errors}

function checkstratifiednegation(datum, strata)
 {if (symbolp(datum)) {return true};
  if (datum[0]!=='rule') {return true};
  var stratum = strata[operator(datum[1])];
  for (var j=2; j<datum.length; j++)
      {if (symbolp(datum[j])) {continue};
       if (datum[j][0]==='not')
          {if (strata[operator(datum[j][1])]>=stratum) {return false};
           continue};
       if (aggregatep(datum[j][0]))
          {var rs = getrelations(datum[j],seq());
           for (var k=0; k<rs.length; k++)
               {if (strata[rs[k]]>=stratum) {return false}}}};
   return true}

function checkstratifiedrecursion (datum,strata)
 {if (symbolp(datum)) {return true};
  if (datum[0]!=='rule') {return true};
  var stratum = strata[operator(datum[1])];
  var hs = seq(); //vars(datum[1]);
  var vs = seq();
  for (var j = 2; j<datum.length; j++)
      {if (symbolp(datum[j]) || (datum[j][0]!=='not' && !aggregatep(datum[j])))
          {if (strata[operator(datum[j])]>=stratum)
              {hs = varsexp(datum[j],hs)}
           else {vs = varsexp(datum[j],vs)}}};
  for (var i=0; i<hs.length; i++)
      {if (!findq(hs[i],vs)) {return false}};
  return true}

var succ = {}, stack = [], vertex = {}, _index = 0, scc = [];

function getstrata(data)
 {var scc = getscc(data);
  var stratum = 0;
  var strata = seq();
  for (var i = scc.length-1; i>=0; i--)
      {for (var j=0; j<scc[i].length; j++)
           {strata[scc[i][j]] = stratum};
       stratum++};
  return strata}

function getscc(data)
 {scc = [], _index = 0, stack = [], vertex = {}, succ = {};
  var rs = getallrelations(data)
  for (var i=0; i<rs.length; i++)
      {succ[rs[i]] = [];
       vertex[rs[i]] = {}}
  for (var i=0; i<data.length; i++)
      {if (data[i][0] == "rule")
          {var headrel = operator(data[i][1]);
           var relsucc = getallrelations(data[i].slice(2));
           for (var j = 0; j < relsucc.length; j++)
               {succ[relsucc[j]] = adjoin(headrel, succ[relsucc[j]])}}}
  for (var i=0; i<rs.length; i++)
      {if (typeof vertex[rs[i]].index == 'undefined') {visit(rs[i])}};
  return scc}

function visit(v)
 {vertex[v].index = _index;
  vertex[v].low = _index;
  _index++;
  stack.push(v);
  vertex[v].onstack = true;
  for (var i=0; i<succ[v].length; i++)
      {var w = succ[v][i];
       if (updateop(w)) continue;
       if (typeof vertex[w].index=='undefined')
          {visit(w);
           vertex[v].low = Math.min(vertex[v].low,vertex[w].low)}
       else if (vertex[w].onstack)
               {vertex[v].low = Math.min(vertex[v].low,vertex[w].low)}}	
  if (vertex[v].low==vertex[v].index)
     {var _scc = [], w = null;
      while (w != v)
       {w = stack.pop();
        vertex[w].onstack = false;
        _scc.push(w)}
      scc.push(_scc)}}

function getallrelations (data)
 {var rs = seq();
  for (var i=0; i<data.length; i++)
      {rs = getrelations(data[i],rs)};
  return rs}

function getrelations (datum,rs)
 {if (symbolp(datum)) {return adjoin(datum,rs)};
  if (datum[0]==='not' || updateop(datum[0]))
     {return getrelations(datum[1],rs)};
  if (datum[0]==='rule' || datum[0]==='and' || datum[0]==='or')
     {for (var j=1; j<datum.length; j++) {rs = getrelations(datum[j],rs)};
      return rs};
  if (builtinp(datum[0])) {return rs};
  if (mathp(datum[0])) {return rs};
  if (listop(datum[0])) {return rs};
  if (aggregatep(datum[0])) {return getrelations(datum[2],rs)};
  return adjoin(datum[0],rs)}

//==============================================================================
// End
//==============================================================================

module.exports = {
    read: read,
    readdata: readdata,
    grindem: grindem,
    compfinds: compfinds,
    definemorefacts: definemorefacts,
    definemorerules: definemorerules
    
}